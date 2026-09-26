from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

# ============================================================
# QUANTUM IMPORTS
# ============================================================

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


# ============================================================
# ATULYA JEEVAN — ML + QUANTUM ENGINE
# ============================================================

app = FastAPI(
    title="ATULYA JEEVAN ML + Quantum Engine",
    version="1.1.0",
    description=(
        "Research prototype for explainable disease-risk "
        "screening with classical ML and quantum simulation."
    )
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]


# ============================================================
# DATASET PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "pima.csv"

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found: {DATASET_PATH}"
    )


# ============================================================
# LOAD DATASET
# ============================================================

df = pd.read_csv(
    DATASET_PATH,
    header=None,
    names=FEATURES + ["Outcome"]
)


# ============================================================
# DATA CLEANING
# ============================================================

zero_columns = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
]

for col in zero_columns:
    df[col] = df[col].replace(0, np.nan)
    df[col] = df[col].fillna(df[col].median())


# Make sure numeric columns are numeric

for col in FEATURES + ["Outcome"]:
    df[col] = pd.to_numeric(
        df[col],
        errors="coerce"
    )


# Remove invalid rows

df = df.dropna(
    subset=FEATURES + ["Outcome"]
)


# ============================================================
# X / Y
# ============================================================

X = df[FEATURES]
y = df["Outcome"].astype(int)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ============================================================
# MACHINE LEARNING MODELS
# ============================================================

models = {

    "Logistic Regression": Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "model",
            LogisticRegression(
                max_iter=2000,
                random_state=42
            )
        )
    ]),

    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    ),

    "SVM": Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "model",
            SVC(
                kernel="rbf",
                probability=True,
                random_state=42
            )
        )
    ]),

    "XGBoost": XGBClassifier(
        n_estimators=250,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1
    ),
}


# ============================================================
# TRAIN MODELS
# ============================================================

trained_models = {}
benchmark = {}


for name, model in models.items():

    # --------------------------------------------------------
    # Train
    # --------------------------------------------------------

    model.fit(
        X_train,
        y_train
    )

    # --------------------------------------------------------
    # Predictions
    # --------------------------------------------------------

    predictions = model.predict(
        X_test
    )

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    # --------------------------------------------------------
    # Confusion Matrix
    # --------------------------------------------------------

    tn, fp, fn, tp = confusion_matrix(
        y_test,
        predictions,
        labels=[0, 1]
    ).ravel()

    # --------------------------------------------------------
    # Sensitivity
    # --------------------------------------------------------

    sensitivity = (
        tp / (tp + fn)
        if (tp + fn) > 0
        else 0.0
    )

    # --------------------------------------------------------
    # Specificity
    # --------------------------------------------------------

    specificity = (
        tn / (tn + fp)
        if (tn + fp) > 0
        else 0.0
    )

    # --------------------------------------------------------
    # Benchmark Metrics
    # --------------------------------------------------------

    benchmark[name] = {

        "accuracy": round(
            accuracy_score(
                y_test,
                predictions
            ),
            4
        ),

        "precision": round(
            precision_score(
                y_test,
                predictions,
                zero_division=0
            ),
            4
        ),

        "recall": round(
            recall_score(
                y_test,
                predictions,
                zero_division=0
            ),
            4
        ),

        "f1": round(
            f1_score(
                y_test,
                predictions,
                zero_division=0
            ),
            4
        ),

        "roc_auc": round(
            roc_auc_score(
                y_test,
                probabilities
            ),
            4
        ),

        "sensitivity": round(
            sensitivity,
            4
        ),

        "specificity": round(
            specificity,
            4
        ),
    }

    trained_models[name] = model


# ============================================================
# PATIENT INPUT
# ============================================================

class PatientInput(BaseModel):

    pregnancies: float = Field(
        default=0,
        ge=0
    )

    glucose: float = Field(
        default=120,
        ge=0
    )

    blood_pressure: float = Field(
        default=70,
        ge=0
    )

    skin_thickness: float = Field(
        default=20,
        ge=0
    )

    insulin: float = Field(
        default=80,
        ge=0
    )

    bmi: float = Field(
        default=25,
        ge=0
    )

    diabetes_pedigree: float = Field(
        default=0.47,
        ge=0
    )

    age: float = Field(
        default=30,
        ge=0
    )


# ============================================================
# QUANTUM ENGINE
# ============================================================

quantum_simulator = AerSimulator()


def run_quantum_experiment(patient: PatientInput):

    # --------------------------------------------------------
    # FOUR MEDICAL FEATURES
    # --------------------------------------------------------

    normalized_features = np.array([

        np.clip(
            patient.glucose / 200.0,
            0,
            1
        ),

        np.clip(
            patient.bmi / 50.0,
            0,
            1
        ),

        np.clip(
            patient.age / 100.0,
            0,
            1
        ),

        np.clip(
            patient.blood_pressure / 150.0,
            0,
            1
        )

    ], dtype=float)


    # --------------------------------------------------------
    # MAP FEATURES TO ROTATION ANGLES
    # --------------------------------------------------------

    angles = normalized_features * np.pi


    # --------------------------------------------------------
    # CREATE 4-QUBIT CIRCUIT
    # --------------------------------------------------------

    qc = QuantumCircuit(
        4,
        4
    )


    # --------------------------------------------------------
    # QUANTUM FEATURE ENCODING
    # --------------------------------------------------------

    for i, angle in enumerate(angles):

        qc.ry(
            float(angle),
            i
        )


    # --------------------------------------------------------
    # ENTANGLEMENT
    # --------------------------------------------------------

    for i in range(3):

        qc.cx(
            i,
            i + 1
        )


    # --------------------------------------------------------
    # MEASUREMENT
    # --------------------------------------------------------

    qc.measure(
        range(4),
        range(4)
    )


    # --------------------------------------------------------
    # RUN QUANTUM SIMULATION
    # --------------------------------------------------------

    result = quantum_simulator.run(
        qc,
        shots=1024
    ).result()


    counts = result.get_counts()


    # --------------------------------------------------------
    # TOTAL SHOTS
    # --------------------------------------------------------

    total_shots = sum(
        counts.values()
    )


    # --------------------------------------------------------
    # QUANTUM SCORE
    # --------------------------------------------------------

    weighted_score = 0.0


    for state, count in counts.items():

        # Count number of measured |1> states

        ones = state.count("1")

        # Convert 0-4 into 0-1

        state_score = ones / 4.0

        weighted_score += (
            state_score
            * count
            / total_shots
        )


    # Keep inside probability range

    quantum_score = float(
        np.clip(
            weighted_score,
            0,
            1
        )
    )


    # --------------------------------------------------------
    # QUANTUM RISK LEVEL
    # --------------------------------------------------------

    if quantum_score >= 0.70:

        quantum_risk_level = "HIGH"

    elif quantum_score >= 0.40:

        quantum_risk_level = "MODERATE"

    else:

        quantum_risk_level = "LOW"


    # --------------------------------------------------------
    # RETURN QUANTUM EXPERIMENT
    # --------------------------------------------------------

    return {

        "qubits": 4,

        "shots": total_shots,

        "features_used": [
            "Glucose",
            "BMI",
            "Age",
            "BloodPressure"
        ],

        "feature_values": {

            "Glucose": float(
                patient.glucose
            ),

            "BMI": float(
                patient.bmi
            ),

            "Age": float(
                patient.age
            ),

            "BloodPressure": float(
                patient.blood_pressure
            )
        },

        "normalized_features": [

            round(
                float(x),
                4
            )

            for x in normalized_features
        ],

        "rotation_angles": [

            round(
                float(x),
                4
            )

            for x in angles
        ],

        "measurement_counts": counts,

        "quantum_score": round(
            quantum_score,
            4
        ),

        "quantum_percentage": round(
            quantum_score * 100,
            2
        ),

        "quantum_risk_level":
            quantum_risk_level,

        "simulator":
            "Qiskit AerSimulator"
    }


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "project":
            "ATULYA JEEVAN",

        "engine":
            "Classical ML + Quantum Research Engine",

        "status":
            "online",

        "dataset":
            "PIMA Indians Diabetes Dataset",

        "models":
            list(
                trained_models.keys()
            ),

        "quantum":
            "4-qubit AerSimulator"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {

        "status":
            "healthy",

        "engine":
            "online",

        "models_loaded":
            len(trained_models),

        "dataset_rows":
            len(df),

        "quantum_engine":
            "online",

        "quantum_qubits":
            4
    }


# ============================================================
# BENCHMARK
# ============================================================

@app.get("/benchmark")
def get_benchmark():

    return {

        "project":
            "ATULYA JEEVAN",

        "dataset":
            "PIMA Indians Diabetes Dataset",

        "evaluation": {

            "test_size":
                0.20,

            "random_state":
                42,

            "stratified":
                True
        },

        "models":
            benchmark
    }


# ============================================================
# CLASSICAL PREDICTION
# ============================================================

@app.post("/predict")
def predict(
    patient: PatientInput
):

    # --------------------------------------------------------
    # Convert input into dataframe
    # --------------------------------------------------------

    values = pd.DataFrame(

        [[

            patient.pregnancies,

            patient.glucose,

            patient.blood_pressure,

            patient.skin_thickness,

            patient.insulin,

            patient.bmi,

            patient.diabetes_pedigree,

            patient.age,

        ]],

        columns=FEATURES

    )


    # --------------------------------------------------------
    # Run all classical models
    # --------------------------------------------------------

    results = {}


    for name, model in trained_models.items():

        probability = float(

            model.predict_proba(
                values
            )[0][1]

        )

        prediction = int(
            probability >= 0.5
        )


        results[name] = {

            "risk_probability":
                round(
                    probability,
                    4
                ),

            "risk_percentage":
                round(
                    probability * 100,
                    2
                ),

            "prediction":
                prediction
        }


    # --------------------------------------------------------
    # Ensemble Probability
    # --------------------------------------------------------

    probabilities = [

        result[
            "risk_probability"
        ]

        for result in results.values()

    ]


    ensemble_probability = float(
        np.mean(
            probabilities
        )
    )


    # --------------------------------------------------------
    # Risk Level
    # --------------------------------------------------------

    if ensemble_probability >= 0.70:

        risk_level = "HIGH"

    elif ensemble_probability >= 0.40:

        risk_level = "MODERATE"

    else:

        risk_level = "LOW"


    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "project":
            "ATULYA JEEVAN",

        "screening_type":
            "Research Prototype",

        "risk_probability":
            round(
                ensemble_probability,
                4
            ),

        "risk_percentage":
            round(
                ensemble_probability * 100,
                2
            ),

        "risk_level":
            risk_level,

        "models":
            results,

        "input": {

            "pregnancies":
                patient.pregnancies,

            "glucose":
                patient.glucose,

            "blood_pressure":
                patient.blood_pressure,

            "skin_thickness":
                patient.skin_thickness,

            "insulin":
                patient.insulin,

            "bmi":
                patient.bmi,

            "diabetes_pedigree":
                patient.diabetes_pedigree,

            "age":
                patient.age
        },

        "note":
            (
                "This output is a research screening "
                "result and is not a clinical diagnosis."
            )
    }


# ============================================================
# QUANTUM PREDICTION / EXPERIMENT
# ============================================================

@app.post("/quantum")
def quantum_predict(
    patient: PatientInput
):

    quantum_result = (
        run_quantum_experiment(
            patient
        )
    )


    return {

        "project":
            "ATULYA JEEVAN",

        "engine":
            "Quantum Medical Research Engine",

        "experiment_type":
            "4-Qubit Quantum Experiment",

        "screening_type":
            "Research Prototype",

        "quantum":
            quantum_result,

        "note":
            (
                "Quantum output is an experimental "
                "model result and is not a clinical diagnosis."
            )
    }