"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BrainCircuit,
  Dna,
  Gauge,
  GitBranch,
  MessageCircle,
  Moon,
  Network,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Zap,
  HeartPulse,
  ScanLine,
  ChevronRight,
} from "lucide-react";

const initial = {
  glucose: 128,
  bmi: 26.4,
  age: 47,
  bp: 82,
  insulin: 110,
};

const clamp = (n, a, b) =>
  Math.max(a, Math.min(b, n));

function score(v) {
  return clamp(
    Math.round(
      38 +
        (v.glucose - 100) * 0.45 +
        (v.bmi - 22) * 3.2 +
        (v.age - 35) * 0.7 +
        (v.bp - 75) * 0.55 +
        (v.insulin - 90) * 0.08
    ),
    4,
    96
  );
}

function model(v) {
  const s = score(v);

  const q = clamp(
    Math.round(
      s * 0.94 +
        Math.sin(v.glucose / 30) * 3
    ),
    3,
    97
  );

  return {
    s,
    q,
    hybrid: Math.round((s + q) / 2),
  };
}

export default function App() {
  const [v, setV] = useState(initial);
  const [tab, setTab] = useState("command");
  const [chat, setChat] = useState(false);
  const [dark, setDark] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "I can explain the screening pipeline, evidence graph, quantum layer and counterfactual experiments.",
    },
  ]);

  /* =====================================================
     REAL ML BACKEND STATE
  ===================================================== */

  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState("");

  /* =====================================================
     REAL BENCHMARK BACKEND STATE
  ===================================================== */

  const [benchmarkData, setBenchmarkData] =
    useState(null);

  const [benchmarkLoading, setBenchmarkLoading] =
    useState(false);

  const [benchmarkError, setBenchmarkError] =
    useState("");

  /* =====================================================
     REAL QUANTUM BACKEND STATE
  ===================================================== */

  const [quantumResult, setQuantumResult] =
    useState(null);

  const [quantumLoading, setQuantumLoading] =
    useState(false);

  const [quantumError, setQuantumError] =
    useState("");

  const m = useMemo(
    () => model(v),
    [v]
  );

  const update = (k, x) => {
    setV({
      ...v,
      [k]: Number(x),
    });

    setMlResult(null);
    setMlError("");

    setQuantumResult(null);
    setQuantumError("");
  };

  /* =====================================================
     REAL FASTAPI ML CALL
  ===================================================== */

  const runMLPrediction = async () => {
    setMlLoading(true);
    setMlError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pregnancies: 2,
            glucose: v.glucose,
            blood_pressure: v.bp,
            skin_thickness: 20,
            insulin: v.insulin,
            bmi: v.bmi,
            diabetes_pedigree: 0.47,
            age: v.age,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `ML API returned ${response.status}`
        );
      }

      const data = await response.json();

      setMlResult(data);
    } catch (error) {
      console.error(error);

      setMlError(
        "ML engine unavailable. Make sure FastAPI is running on port 8000 and CORS allows this frontend port."
      );
    } finally {
      setMlLoading(false);
    }
  };

  /* =====================================================
     REAL FASTAPI BENCHMARK CALL
  ===================================================== */

  const loadBenchmark = async () => {
    setBenchmarkLoading(true);
    setBenchmarkError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/benchmark"
      );

      if (!response.ok) {
        throw new Error(
          `Benchmark API returned ${response.status}`
        );
      }

      const data = await response.json();

      setBenchmarkData(data);
    } catch (error) {
      console.error(error);

      setBenchmarkError(
        "Benchmark engine unavailable. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setBenchmarkLoading(false);
    }
  };

  /* =====================================================
     REAL FASTAPI QUANTUM CALL
  ===================================================== */

  const runQuantumExperiment = async () => {
    setQuantumLoading(true);
    setQuantumError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/quantum",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pregnancies: 2,
            glucose: v.glucose,
            blood_pressure: v.bp,
            skin_thickness: 20,
            insulin: v.insulin,
            bmi: v.bmi,
            diabetes_pedigree: 0.47,
            age: v.age,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Quantum API returned ${response.status}`
        );
      }

      const data = await response.json();

      setQuantumResult(data);
    } catch (error) {
      console.error(error);

      setQuantumError(
        "Quantum engine unavailable. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setQuantumLoading(false);
    }
  };

  /* =====================================================
     FEATURES
  ===================================================== */

  const features = [
    [
      "Glucose",
      v.glucose,
      Math.round(
        clamp(
          ((v.glucose - 90) / 70) * 100,
          5,
          100
        )
      ),
      "mg/dL",
    ],

    [
      "BMI",
      v.bmi.toFixed(1),
      Math.round(
        clamp(
          ((v.bmi - 18) / 20) * 100,
          5,
          100
        )
      ),
      "kg/m²",
    ],

    [
      "Age",
      v.age,
      Math.round(
        clamp(
          ((v.age - 18) / 65) * 100,
          5,
          100
        )
      ),
      "years",
    ],

    [
      "Blood pressure",
      v.bp,
      Math.round(
        clamp(
          ((v.bp - 55) / 55) * 100,
          5,
          100
        )
      ),
      "mmHg",
    ],
  ];

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const nav = [
    ["command", "Overview", Activity],
    ["screen", "Screening", Target],
    ["benchmark", "Benchmark", Gauge],
    ["twin", "Health Twin", Dna],
    ["quantum", "Quantum Lab", Zap],
    ["evidence", "Evidence Graph", Network],
    ["counter", "What-if Lab", GitBranch],
  ];

  const runWhatIf = () =>
    setV({
      ...v,
      glucose: clamp(
        v.glucose - 15,
        70,
        220
      ),
    });

  /* =====================================================
     CHAT
  ===================================================== */

  function send(e) {
    e.preventDefault();

    const input =
      e.target.msg.value.trim();

    if (!input) return;

    setMessages([
      ...messages,
      {
        role: "user",
        text: input,
      },
      {
        role: "ai",
        text: "This research prototype can explain feature sensitivity, the classical/quantum pathway and experiment outputs. Connect an LLM provider through /api/chat for live answers.",
      },
    ]);

    e.target.reset();
  }

  return (
    <main
      className={
        dark
          ? "app dark"
          : "app"
      }
    >
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="topbar">
        <div className="brand">
          <div className="brandmark">
            <span>A</span>
            <small>J</small>
          </div>

          <div>
            <div className="brandname">
              ATULYA JEEVAN
            </div>

            <div className="brandtag">
              QUANTUM-ENHANCED MEDICAL INTELLIGENCE
            </div>
          </div>
        </div>

        <div className="topActions">
          <div className="live">
            <i />
            LIVE RESEARCH ENVIRONMENT
          </div>

          <button
            className="iconBtn"
            onClick={() =>
              setDark(!dark)
            }
            title="Toggle day/night"
          >
            {dark ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          <button
            className="aiBtn"
            onClick={() =>
              setChat(true)
            }
          >
            <MessageCircle
              size={17}
            />
            ATULYA AI
          </button>
        </div>
      </header>

      <div className="shell">
        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside>
          <div className="sideTitle">
            RESEARCH OS
          </div>

          {nav.map(
            ([id, label, Icon]) => (
              <button
                key={id}
                className={
                  "nav " +
                  (tab === id
                    ? "active"
                    : "")
                }
                onClick={() =>
                  setTab(id)
                }
              >
                <Icon size={18} />
                <span>
                  {label}
                </span>
              </button>
            )
          )}

          <div className="sideBottom">
            <ShieldCheck size={17} />

            <div>
              <b>
                Research mode
              </b>

              <small>
                Not for diagnosis
              </small>
            </div>
          </div>
        </aside>

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <section className="content">
          <div className="crumb">
            ATULYA JEEVAN
            <ChevronRight size={13} />
            {tab.toUpperCase()}
          </div>

          {/* =================================================
              COMMAND CENTER
          ================================================= */}

          {tab === "command" && (
            <>
              <section className="hero2">
                <div className="heroCopy">
                  <div className="eyebrow">
                    <ScanLine size={15} />
                    COMPUTATIONAL HEALTH INTELLIGENCE
                  </div>

                  <h1>
                    See the patient signal.
                    <br />
                    <em>
                      Trace every decision.
                    </em>
                  </h1>

                  <p>
                    One research workspace
                    for biomedical screening,
                    hybrid quantum experiments
                    and transparent model
                    evidence.
                  </p>

                  <div className="heroBtns">
                    <button
                      className="primary"
                      onClick={() =>
                        setTab("screen")
                      }
                    >
                      <Play size={16} />
                      Open Screening
                    </button>

                    <button
                      className="ghost"
                      onClick={() =>
                        setTab("twin")
                      }
                    >
                      <Dna size={16} />
                      View Health Twin
                    </button>
                  </div>

                  <div className="trust">
                    <span>
                      CLASSICAL ML
                    </span>

                    <span>
                      HYBRID QML
                    </span>

                    <span>
                      EXPLAINABLE
                    </span>

                    <span>
                      BENCHMARKABLE
                    </span>
                  </div>
                </div>

                <div className="heroVisual">
                  <div className="orbit o1" />
                  <div className="orbit o2" />
                  <div className="orbit o3" />

                  <div className="heroPulse">
                    <HeartPulse
                      size={26}
                    />

                    <strong>
                      {mlResult
                        ? mlResult.risk_percentage
                        : m.hybrid}
                      %
                    </strong>

                    <small>
                      {mlResult
                        ? "LIVE ML RISK"
                        : "HYBRID INDEX"}
                    </small>
                  </div>

                  <div className="miniStat s1">
                    <b>
                      {mlResult
                        ? Math.round(
                            mlResult
                              .models[
                              "Logistic Regression"
                            ]
                              ?.risk_probability *
                              100
                          )
                        : m.s}
                      %
                    </b>

                    <span>
                      CLASSICAL
                    </span>
                  </div>

                  <div className="miniStat s2">
                    <b>
                      {quantumResult
                        ? quantumResult.quantum
                            .quantum_percentage
                        : m.q}
                      %
                    </b>

                    <span>
                      QUANTUM
                    </span>
                  </div>

                  <div className="miniStat s3">
                    <b>05</b>
                    <span>
                      FEATURES
                    </span>
                  </div>
                </div>
              </section>

              <div className="quickGrid">
                <div className="quick">
                  <span>
                    Current profile
                  </span>

                  <strong>
                    {mlResult
                      ? mlResult.risk_percentage
                      : m.hybrid}
                    %
                  </strong>

                  <small>
                    {mlResult
                      ? "measured ML result"
                      : "computed research index"}
                  </small>
                </div>

                <div className="quick">
                  <span>
                    Feature state
                  </span>

                  <strong>
                    04 + 01
                  </strong>

                  <small>
                    core + supporting signal
                  </small>
                </div>

                <div className="quick">
                  <span>
                    Quantum layer
                  </span>

                  <strong>
                    04 Q
                  </strong>

                  <small>
                    simulator experiment
                  </small>
                </div>

                <div className="quick">
                  <span>
                    Evidence
                  </span>

                  <strong>
                    TRACE
                  </strong>

                  <small>
                    feature → model → output
                  </small>
                </div>
              </div>

              <div className="dashGrid">
                <Panel
                  title="Signal map"
                  icon={<Dna />}
                >
                  <div className="signalMap">
                    {features.map(
                      (f, i) => (
                        <div
                          className="sig"
                          key={f[0]}
                        >
                          <div className="sigTop">
                            <span>
                              {f[0]}
                            </span>

                            <b>
                              {f[1]}{" "}
                              <small>
                                {f[3]}
                              </small>
                            </b>
                          </div>

                          <div className="track">
                            <i
                              style={{
                                width:
                                  f[2] +
                                  "%",
                              }}
                            />
                          </div>

                          <em>
                            {i === 0
                              ? "PRIMARY"
                              : "SUPPORTING"}
                          </em>
                        </div>
                      )
                    )}
                  </div>
                </Panel>

                <Panel
                  title="Research pipeline"
                  icon={
                    <BrainCircuit />
                  }
                >
                  <div className="pipeline">
                    <div>
                      <b>01</b>
                      <span>
                        INPUT
                      </span>
                    </div>

                    <i />

                    <div>
                      <b>02</b>
                      <span>
                        FEATURES
                      </span>
                    </div>

                    <i />

                    <div>
                      <b>03</b>
                      <span>
                        QML
                      </span>
                    </div>

                    <i />

                    <div>
                      <b>04</b>
                      <span>
                        EVIDENCE
                      </span>
                    </div>
                  </div>

                  <div className="pipelineFoot">
                    Classical preprocessing
                    → quantum representation
                    → explainable result
                  </div>
                </Panel>

                <Panel
                  title="Guardrails"
                  icon={
                    <ShieldCheck />
                  }
                >
                  <div className="guardBig">
                    <strong>
                      RESEARCH
                      <br />
                      PROTOTYPE
                    </strong>

                    <p>
                      Designed for
                      experimentation and
                      demonstration. It does
                      not diagnose, prescribe
                      or replace clinical
                      evaluation.
                    </p>

                    <div>
                      <span>
                        ✓ Transparent
                      </span>

                      <span>
                        ✓ Reproducible
                      </span>
                    </div>
                  </div>
                </Panel>
              </div>
            </>
          )}

          {/* =================================================
              SCREENING
          ================================================= */}

          {tab === "screen" && (
            <Screen
              v={v}
              update={update}
              m={m}
              setTab={setTab}
              mlResult={mlResult}
              mlLoading={mlLoading}
              mlError={mlError}
              runMLPrediction={
                runMLPrediction
              }
            />
          )}

          {/* =================================================
              BENCHMARK
          ================================================= */}

          {tab === "benchmark" && (
            <Benchmark
              data={benchmarkData}
              loading={
                benchmarkLoading
              }
              error={
                benchmarkError
              }
              load={
                loadBenchmark
              }
            />
          )}

          {/* =================================================
              HEALTH TWIN
          ================================================= */}

          {tab === "twin" && (
            <Twin
              v={v}
              m={m}
              features={features}
            />
          )}

          {/* =================================================
              QUANTUM
          ================================================= */}

          {tab === "quantum" && (
            <Quantum
              m={m}
              result={quantumResult}
              loading={quantumLoading}
              error={quantumError}
              runExperiment={
                runQuantumExperiment
              }
            />
          )}

          {/* =================================================
              EVIDENCE
          ================================================= */}

          {tab === "evidence" && (
            <Evidence
              features={features}
              m={m}
              mlResult={
                mlResult
              }
            />
          )}

          {/* =================================================
              WHAT IF
          ================================================= */}

          {tab === "counter" && (
            <Counter
              v={v}
              update={update}
              m={m}
              run={runWhatIf}
            />
          )}
        </section>
      </div>

      <footer>
        ATULYA JEEVAN
        <span>•</span>
        Experimental
        medical-intelligence
        interface
        <span>•</span>
        Not a clinical diagnostic
        system
      </footer>

      {/* =====================================================
          ATULYA AI
      ===================================================== */}

      {chat && (
        <div
          className="overlay"
          onClick={() =>
            setChat(false)
          }
        >
          <div
            className="chat"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="chatHead">
              <div>
                <b>
                  ATULYA AI
                </b>

                <small>
                  Research assistant
                </small>
              </div>

              <button
                onClick={() =>
                  setChat(false)
                }
              >
                ×
              </button>
            </div>

            <div className="chatBody">
              {messages.map(
                (x, i) => (
                  <div
                    className={
                      x.role === "ai"
                        ? "msg ai"
                        : "msg user"
                    }
                    key={i}
                  >
                    {x.text}
                  </div>
                )
              )}
            </div>

            <form onSubmit={send}>
              <input
                name="msg"
                placeholder="Ask about the model or evidence..."
              />

              <button>
                <Zap size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   PANEL
========================================================= */

function Panel({
  title,
  icon,
  children,
}) {
  return (
    <div className="panel">
      <div className="panelHead">
        {icon}
        <b>{title}</b>
        <span>LIVE</span>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   SCREENING
========================================================= */

function Screen({
  v,
  update,
  m,
  setTab,
  mlResult,
  mlLoading,
  mlError,
  runMLPrediction,
}) {
  const risk = mlResult
    ? mlResult.risk_percentage
    : m.hybrid;

  const level = mlResult
    ? mlResult.risk_level
    : risk >= 70
      ? "HIGH"
      : risk >= 40
        ? "MODERATE"
        : "LOW";

  return (
    <>
      <div className="pageHead">
        <div>
          <div className="eyebrow">
            01 / INTELLIGENT SCREENING
          </div>

          <h2>
            Build a computational
            health profile.
          </h2>

          <p>
            Adjust inputs and observe
            the research model response.
          </p>
        </div>

        <button
          className="ghost"
          onClick={() =>
            setTab("evidence")
          }
        >
          <Network size={16} />
          Explain result
        </button>
      </div>

      <div className="screenGrid">
        <div className="panel form">
          {[
            [
              "glucose",
              "Glucose",
              "mg/dL",
              70,
              220,
            ],

            [
              "bmi",
              "BMI",
              "kg/m²",
              15,
              45,
            ],

            [
              "age",
              "Age",
              "years",
              18,
              85,
            ],

            [
              "bp",
              "Blood pressure",
              "mmHg",
              50,
              130,
            ],

            [
              "insulin",
              "Insulin",
              "µU/mL",
              20,
              300,
            ],
          ].map(
            ([
              k,
              l,
              u,
              min,
              max,
            ]) => (
              <label key={k}>
                <div>
                  <span>
                    {l}
                  </span>

                  <b>
                    {v[k]}{" "}
                    <small>
                      {u}
                    </small>
                  </b>
                </div>

                <input
                  type="range"
                  min={min}
                  max={max}
                  step={
                    k === "bmi"
                      ? 0.1
                      : 1
                  }
                  value={v[k]}
                  onChange={(e) =>
                    update(
                      k,
                      e.target.value
                    )
                  }
                />
              </label>
            )
          )}

          <div className="note">
            <ShieldCheck
              size={15}
            />

            Current UI sends:
            <br />

            Pregnancies = 2
            <br />

            Skin Thickness = 20
            <br />

            Diabetes Pedigree = 0.47
          </div>

          <button
            className="primary wide"
            onClick={
              runMLPrediction
            }
            disabled={
              mlLoading
            }
          >
            {mlLoading ? (
              <>
                <Sparkles
                  size={16}
                />
                RUNNING ML ENGINE...
              </>
            ) : (
              <>
                <BrainCircuit
                  size={16}
                />
                RUN REAL ML SCREENING
              </>
            )}
          </button>

          {mlError && (
            <div className="note">
              {mlError}
            </div>
          )}
        </div>

        <div className="resultPanel">
          <div className="resultRing">
            <span>
              {Math.round(risk)}%
            </span>

            <small>
              {mlResult
                ? "MEASURED RISK"
                : "HYBRID INDEX"}
            </small>
          </div>

          <h3>
            {mlResult
              ? `Research screening: ${level}`
              : "Model response"}
          </h3>

          {mlResult ? (
            <div className="two">
              {Object.entries(
                mlResult.models || {}
              ).map(
                ([name, data]) => (
                  <div key={name}>
                    <span>
                      {name.toUpperCase()}
                    </span>

                    <b>
                      {Math.round(
                        data.risk_probability *
                          100
                      )}
                      %
                    </b>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="two">
              <div>
                <span>
                  CLASSICAL
                </span>

                <b>
                  {m.s}%
                </b>
              </div>

              <div>
                <span>
                  QUANTUM
                </span>

                <b>
                  {m.q}%
                </b>
              </div>
            </div>
          )}

          <button
            className="primary wide"
            onClick={() =>
              setTab("counter")
            }
          >
            Run what-if experiment
            <GitBranch
              size={16}
            />
          </button>

          <div className="note">
            {mlResult
              ? mlResult.note
              : "Run the real ML screening to replace this local illustrative signal with measured backend model outputs."}
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   BENCHMARK
========================================================= */

function Benchmark({
  data,
  loading,
  error,
  load,
}) {
  const models =
    data?.models || {};

  return (
    <>
      <div className="pageHead">
        <div>
          <div className="eyebrow">
            02 / MODEL BENCHMARK
          </div>

          <h2>
            Experimental model
            comparison.
          </h2>

          <p>
            Measured performance from
            the current PIMA evaluation
            setup.
          </p>
        </div>

        <button
          className="primary"
          onClick={load}
          disabled={loading}
        >
          <Gauge size={16} />

          {loading
            ? "LOADING..."
            : "REFRESH BENCHMARK"}
        </button>
      </div>

      {!data &&
        !loading &&
        !error && (
          <div className="panel">
            <div className="panelHead">
              <Gauge />
              <b>
                Benchmark engine
              </b>
              <span>
                READY
              </span>
            </div>

            <div
              style={{
                padding:
                  "28px",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Live experimental
                metrics
              </h3>

              <p>
                Fetch the measured
                evaluation metrics
                directly from the
                FastAPI ML engine.
              </p>

              <button
                className="primary"
                onClick={load}
              >
                <Play size={16} />
                RUN BENCHMARK
              </button>
            </div>
          </div>
        )}

      {loading && (
        <div className="panel">
          <div
            style={{
              padding: "50px",
              textAlign:
                "center",
            }}
          >
            <Sparkles
              size={22}
            />

            <h3>
              Loading measured
              model metrics...
            </h3>

            <p>
              Connecting to
              FastAPI /benchmark
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="note">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="quickGrid">
            <div className="quick">
              <span>
                DATASET
              </span>

              <strong>
                PIMA
              </strong>

              <small>
                Diabetes dataset
              </small>
            </div>

            <div className="quick">
              <span>
                MODELS
              </span>

              <strong>
                {
                  Object.keys(
                    models
                  ).length
                }
              </strong>

              <small>
                classical baselines
              </small>
            </div>

            <div className="quick">
              <span>
                TEST SET
              </span>

              <strong>
                20%
              </strong>

              <small>
                stratified hold-out
              </small>
            </div>

            <div className="quick">
              <span>
                EVALUATION
              </span>

              <strong>
                LIVE
              </strong>

              <small>
                FastAPI benchmark
              </small>
            </div>
          </div>

          <div
            className="panel"
            style={{
              marginTop:
                "24px",
            }}
          >
            <div className="panelHead">
              <Gauge />
              <b>
                Measured performance
              </b>

              <span>
                LIVE
              </span>
            </div>

            <div
              style={{
                overflowX:
                  "auto",
                padding:
                  "0 18px 18px",
              }}
            >
              <table
                style={{
                  width:
                    "100%",
                  minWidth:
                    "900px",
                  borderCollapse:
                    "collapse",
                  fontSize:
                    "13px",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "MODEL",
                      "ACC",
                      "PRECISION",
                      "RECALL",
                      "F1",
                      "ROC-AUC",
                      "SENS.",
                      "SPEC.",
                    ].map(
                      (head) => (
                        <th
                          key={
                            head
                          }
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "14px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                            color:
                              "var(--muted)",
                            fontSize:
                              "10px",
                            letterSpacing:
                              ".08em",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {head}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(
                    models
                  ).map(
                    ([
                      name,
                      metrics,
                    ]) => (
                      <tr
                        key={
                          name
                        }
                      >
                        <td
                          style={{
                            padding:
                              "16px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                          }}
                        >
                          <strong>
                            {name}
                          </strong>
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                          }}
                        >
                          {(
                            metrics.accuracy *
                            100
                          ).toFixed(
                            1
                          )}
                          %
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                          }}
                        >
                          {(
                            metrics.precision *
                            100
                          ).toFixed(
                            1
                          )}
                          %
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                          }}
                        >
                          {(
                            metrics.recall *
                            100
                          ).toFixed(
                            1
                          )}
                          %
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                          }}
                        >
                          {(
                            metrics.f1 *
                            100
                          ).toFixed(
                            1
                          )}
                          %
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                          }}
                        >
                          {Number(
                            metrics.roc_auc
                          ).toFixed(
                            3
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                          }}
                        >
                          {(
                            metrics.sensitivity *
                            100
                          ).toFixed(
                            1
                          )}
                          %
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            borderBottom:
                              "1px solid var(--line)",
                          }}
                        >
                          {(
                            metrics.specificity *
                            100
                          ).toFixed(
                            1
                          )}
                          %
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="note"
            style={{
              marginTop:
                "18px",
            }}
          >
            <ShieldCheck
              size={15}
            />

            These are experimental
            results from the current
            PIMA held-out evaluation
            setup. They are not
            clinical validation and
            do not establish quantum
            advantage.
          </div>
        </>
      )}
    </>
  );
}

/* =========================================================
   HUMAN SVG
========================================================= */

function HumanSVG() {
  return (
    <svg
      className="humanSvg"
      viewBox="0 0 300 620"
      aria-label="Human computational health visualization"
    >
      <defs>
        <linearGradient
          id="skin"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#e7b69b"
          />

          <stop
            offset=".5"
            stopColor="#c9876d"
          />

          <stop
            offset="1"
            stopColor="#7d4b48"
          />
        </linearGradient>

        <linearGradient
          id="coat"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#f4fbfa"
          />

          <stop
            offset="1"
            stopColor="#b8d8d4"
          />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur
            stdDeviation="5"
          />
        </filter>
      </defs>

      <ellipse
        cx="150"
        cy="595"
        rx="82"
        ry="12"
        fill="currentColor"
        opacity=".12"
      />

      <circle
        cx="150"
        cy="72"
        r="48"
        fill="url(#skin)"
      />

      <path
        d="M110 62c4-39 73-48 85 5-22-15-48-20-85-5Z"
        fill="#342a2a"
      />

      <path
        d="M108 125c18-17 66-17 84 0l29 113-40 9-8 91h-46l-8-91-40-9Z"
        fill="url(#coat)"
        stroke="currentColor"
        strokeOpacity=".18"
      />

      <path
        d="M110 136 70 248l36 12 37-91M190 136l40 112-36 12-37-91"
        fill="url(#coat)"
        stroke="currentColor"
        strokeOpacity=".18"
      />

      <path
        d="M137 330v155l-33 100h45l20-100V330M163 330v155l33 100h-45l-20-100V330"
        fill="#27424b"
      />

      <path
        d="M105 244h90"
        stroke="#7de4d8"
        strokeWidth="3"
        opacity=".65"
      />

      <circle
        cx="150"
        cy="255"
        r="18"
        fill="#ff6f91"
        opacity=".75"
        filter="url(#glow)"
      />

      <circle
        cx="150"
        cy="255"
        r="7"
        fill="#ff6f91"
      />

      <circle
        cx="150"
        cy="160"
        r="10"
        fill="#7ee9de"
        opacity=".8"
      />

      <circle
        cx="126"
        cy="200"
        r="7"
        fill="#7ee9de"
        opacity=".65"
      />

      <circle
        cx="174"
        cy="200"
        r="7"
        fill="#7ee9de"
        opacity=".65"
      />

      <path
        d="M150 170v70M130 205l20 28 20-28"
        stroke="#75e8dd"
        strokeWidth="2"
        fill="none"
        opacity=".7"
      />

      <path
        d="M70 290H230"
        stroke="#6ce2d5"
        strokeDasharray="5 7"
        opacity=".35"
      />

      <text
        x="150"
        y="28"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        letterSpacing="3"
      >
        COMPUTATIONAL HUMAN
      </text>
    </svg>
  );
}

/* =========================================================
   HEALTH TWIN
========================================================= */

function Twin({
  m,
  features,
}) {
  return (
    <>
      <div className="pageHead">
        <div>
          <div className="eyebrow">
            02 / COMPUTATIONAL HEALTH TWIN
          </div>

          <h2>
            Human-centred model view.
          </h2>

          <p>
            A visual representation of
            submitted biomedical signals
            — not a clinical digital twin.
          </p>
        </div>
      </div>

      <div className="twinGrid">
        <div className="humanStage">
          <div className="scanGrid" />

          <div className="scanLabel top">
            LIVE FEATURE MAPPING
          </div>

          <HumanSVG />

          <div className="bodyTag heart">
            <HeartPulse
              size={14}
            />
            CARDIO SIGNAL
          </div>

          <div className="bodyTag brain">
            <BrainCircuit
              size={14}
            />
            FEATURE STATE
          </div>

          <div className="bodyTag core">
            <Dna size={14} />
            BIOMARKER CORE
          </div>

          <div className="twinScore">
            <span>
              HYBRID INDEX
            </span>

            <b>
              {m.hybrid}%
            </b>

            <small>
              COMPUTED
            </small>
          </div>
        </div>

        <div className="panel">
          <div className="panelHead">
            <Gauge />
            <b>
              Signal state
            </b>
          </div>

          {features.map(
            (f) => (
              <div
                className="signal"
                key={f[0]}
              >
                <span>
                  {f[0]}
                </span>

                <strong>
                  {f[1]}
                </strong>

                <div>
                  <i
                    style={{
                      width:
                        f[2] +
                        "%",
                    }}
                  />
                </div>
              </div>
            )
          )}

          <div className="insight">
            <Sparkles
              size={17}
            />

            <span>
              Model sensitivity is
              visualized around the
              submitted feature state;
              it should not be
              interpreted as biological
              causation.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   REAL QUANTUM LAB
========================================================= */

function Quantum({
  m,
  result,
  loading,
  error,
  runExperiment,
}) {
  const quantum =
    result?.quantum || null;

  const score = quantum
    ? quantum.quantum_percentage
    : m.q;

  return (
    <>
      <div className="pageHead">
        <div>
          <div className="eyebrow">
            03 / QUANTUM RESEARCH LAB
          </div>

          <h2>
            From feature vector to
            quantum state.
          </h2>

          <p>
            Execute a real 4-qubit
            quantum experiment through
            Qiskit Aer simulator.
          </p>
        </div>

        <button
          className="primary"
          onClick={runExperiment}
          disabled={loading}
        >
          {loading ? (
            <>
              <Sparkles size={16} />
              RUNNING QUANTUM...
            </>
          ) : (
            <>
              <Zap size={16} />
              RUN QUANTUM EXPERIMENT
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="note">
          {error}
        </div>
      )}

      <div className="quantGrid">

        {/* CIRCUIT */}

        <div className="circuit">
          <div className="qHead">
            4-QUBIT EXPERIMENT

            <span>
              {quantum
                ? quantum.simulator
                : "AER SIMULATOR"}
            </span>
          </div>

          {[
            "q0  glucose",
            "q1  BMI",
            "q2  age",
            "q3  blood pressure",
          ].map(
            (q) => (
              <div
                className="qrow"
                key={q}
              >
                <b>{q}</b>

                <i />

                <em>H</em>

                <i />

                <em>RY</em>

                <i />

                <em>ZZ</em>

                <i />

                <span>
                  ⟨Z⟩
                </span>
              </div>
            )
          )}

          <div
            style={{
              marginTop: "22px",
              paddingTop: "16px",
              borderTop:
                "1px solid var(--line)",
              fontSize: "12px",
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            Classical biomedical features
            are encoded into quantum rotation
            angles before measurement.
          </div>
        </div>

        {/* QUANTUM READOUT */}

        <Panel
          title="Quantum readout"
          icon={<Zap />}
        >
          <div className="bigRead">
            {Number(score).toFixed(2)}%

            <small>
              {quantum
                ? "MEASURED QUANTUM SCORE"
                : "WAITING FOR EXPERIMENT"}
            </small>
          </div>

          <div className="readList">
            <span>
              Qubits
              <b>
                {quantum
                  ? quantum.qubits
                  : "04"}
              </b>
            </span>

            <span>
              Shots
              <b>
                {quantum
                  ? quantum.shots
                  : "1024"}
              </b>
            </span>

            <span>
              Feature map
              <b>
                Angle + ZZ
              </b>
            </span>

            <span>
              Simulator
              <b>
                AerSimulator
              </b>
            </span>

            <span>
              Readout
              <b>
                ⟨Z⟩
              </b>
            </span>
          </div>

          {quantum && (
            <div
              style={{
                marginTop: "18px",
                padding: "14px",
                borderRadius: "12px",
                background:
                  "rgba(100,180,180,.06)",
                border:
                  "1px solid var(--line)",
              }}
            >
              <small
                style={{
                  display: "block",
                  color: "var(--muted)",
                  marginBottom: "6px",
                  fontSize: "10px",
                  letterSpacing: ".08em",
                }}
              >
                EXPERIMENTAL RISK STATE
              </small>

              <strong>
                {quantum.quantum_risk_level}
              </strong>
            </div>
          )}
        </Panel>
      </div>

      {/* FEATURE ENCODING */}

      {quantum && (
        <div
          className="panel"
          style={{
            marginTop: "24px",
          }}
        >
          <div className="panelHead">
            <Dna />

            <b>
              Quantum feature encoding
            </b>

            <span>
              MEASURED
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "14px",
              padding: "18px",
            }}
          >
            {Object.entries(
              quantum.feature_values || {}
            ).map(
              ([name, value]) => (
                <div
                  key={name}
                  style={{
                    padding: "16px",
                    border:
                      "1px solid var(--line)",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      display: "block",
                      color:
                        "var(--muted)",
                      fontSize:
                        "10px",
                      letterSpacing:
                        ".08em",
                      marginBottom:
                        "8px",
                    }}
                  >
                    {name.toUpperCase()}
                  </small>

                  <strong>
                    {value}
                  </strong>
                </div>
              )
            )}
          </div>

          <div
            style={{
              padding:
                "0 18px 20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color:
                  "var(--muted)",
                marginBottom:
                  "10px",
              }}
            >
              NORMALIZED FEATURE VECTOR
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {quantum.normalized_features?.map(
                (value, index) => (
                  <div
                    key={index}
                    style={{
                      padding:
                        "9px 13px",
                      border:
                        "1px solid var(--line)",
                      borderRadius:
                        "999px",
                      fontSize:
                        "12px",
                    }}
                  >
                    q{index}:{" "}
                    <b>
                      {Number(
                        value
                      ).toFixed(4)}
                    </b>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROTATION ANGLES */}

      {quantum && (
        <div
          className="panel"
          style={{
            marginTop: "24px",
          }}
        >
          <div className="panelHead">
            <Network />

            <b>
              Quantum rotation angles
            </b>

            <span>
              RY ENCODING
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "14px",
              padding: "18px",
            }}
          >
            {quantum.rotation_angles?.map(
              (angle, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    border:
                      "1px solid var(--line)",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "var(--muted)",
                      fontSize:
                        "10px",
                    }}
                  >
                    Q{index}
                  </small>

                  <div
                    style={{
                      fontSize:
                        "20px",
                      fontWeight: 700,
                      marginTop:
                        "7px",
                    }}
                  >
                    {Number(
                      angle
                    ).toFixed(4)}
                  </div>

                  <small
                    style={{
                      color:
                        "var(--muted)",
                    }}
                  >
                    radians
                  </small>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* MEASUREMENT COUNTS */}

      {quantum && (
        <div
          className="panel"
          style={{
            marginTop: "24px",
          }}
        >
          <div className="panelHead">
            <Activity />

            <b>
              Quantum measurement
              distribution
            </b>

            <span>
              {quantum.shots} SHOTS
            </span>
          </div>

          <div
            style={{
              padding: "18px",
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "10px",
            }}
          >
            {Object.entries(
              quantum.measurement_counts ||
                {}
            ).map(
              ([state, count]) => {
                const percentage =
                  (
                    (count /
                      quantum.shots) *
                    100
                  ).toFixed(1);

                return (
                  <div
                    key={state}
                    style={{
                      padding:
                        "13px",
                      border:
                        "1px solid var(--line)",
                      borderRadius:
                        "10px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        marginBottom:
                          "8px",
                      }}
                    >
                      <strong>
                        |{state}⟩
                      </strong>

                      <span
                        style={{
                          color:
                            "var(--muted)",
                          fontSize:
                            "11px",
                        }}
                      >
                        {count}
                      </span>
                    </div>

                    <div
                      style={{
                        height:
                          "4px",
                        background:
                          "var(--line)",
                        borderRadius:
                          "10px",
                        overflow:
                          "hidden",
                      }}
                    >
                      <div
                        style={{
                          width:
                            `${percentage}%`,
                          height:
                            "100%",
                          background:
                            "currentColor",
                          opacity:
                            0.75,
                        }}
                      />
                    </div>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "7px",
                        color:
                          "var(--muted)",
                      }}
                    >
                      {percentage}%
                    </small>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      <div className="note">
        <ShieldCheck size={15} />

        {quantum
          ? "Quantum output is an experimental model result and is not a clinical diagnosis."
          : "Run the quantum experiment to generate measured Qiskit Aer results. Quantum output is experimental and does not establish clinical validity or quantum advantage."}
      </div>
    </>
  );
}

/* =========================================================
   EVIDENCE
========================================================= */

function Evidence({
  features,
  m,
  mlResult,
}) {
  const output = mlResult
    ? mlResult.risk_percentage
    : m.hybrid;

  return (
    <>
      <div className="pageHead">
        <div>
          <div className="eyebrow">
            04 / EVIDENCE GRAPH
          </div>

          <h2>
            Trace the output back to
            the signal.
          </h2>

          <p>
            Model evidence is not
            medical causation.
          </p>
        </div>
      </div>

      <div className="evidence">
        <div className="eNode root">
          <Dna />

          <b>
            SUBMITTED PROFILE
          </b>

          <strong>
            {output}%
          </strong>

          <small>
            {mlResult
              ? "measured ML output"
              : "hybrid output"}
          </small>
        </div>

        <div className="branches">
          {features.map(
            (f) => (
              <div
                className="branch"
                key={f[0]}
              >
                <div className="line" />

                <div className="eNode">
                  <Activity />

                  <b>
                    {f[0].toUpperCase()}
                  </b>

                  <strong>
                    {f[2]}
                  </strong>

                  <small>
                    relative signal
                  </small>
                </div>
              </div>
            )
          )}
        </div>

        <div className="paths">
          <div>
            <span>
              CLASSICAL PATH
            </span>

            <b>
              Preprocess →
              feature intelligence →
              baseline models
            </b>
          </div>

          <div>
            <span>
              QUANTUM PATH
            </span>

            <b>
              Encode → circuit →
              readout → hybrid output
            </b>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   COUNTERFACTUAL
========================================================= */

function Counter({
  v,
  update,
  m,
  run,
}) {
  const before =
    m.hybrid;

  const after =
    model({
      ...v,
      glucose: clamp(
        v.glucose - 15,
        70,
        220
      ),
    }).hybrid;

  return (
    <>
      <div className="pageHead">
        <div>
          <div className="eyebrow">
            05 / COUNTERFACTUAL LAB
          </div>

          <h2>
            Change one signal.
            Observe the model.
          </h2>

          <p>
            Controlled what-if
            experiments for model
            sensitivity—not treatment
            advice.
          </p>
        </div>

        <button
          className="primary"
          onClick={run}
        >
          Run −15 glucose
          experiment
        </button>
      </div>

      <div className="counterPanel">
        <div className="cfCard">
          <span>
            BASELINE
          </span>

          <b>
            {before}%
          </b>

          <small>
            current profile
          </small>
        </div>

        <div className="cfArrow">
          →
        </div>

        <div className="cfCard accent">
          <span>
            WHAT-IF
          </span>

          <b>
            {after}%
          </b>

          <small>
            glucose −15 mg/dL
          </small>
        </div>

        <div className="delta">
          MODEL RESPONSE

          <strong>
            {after -
              before >
            0
              ? "+"
              : ""}
            {after -
              before}
            %
          </strong>
        </div>
      </div>
    </>
  );
}