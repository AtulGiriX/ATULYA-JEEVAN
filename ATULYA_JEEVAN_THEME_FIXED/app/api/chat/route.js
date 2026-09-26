export async function POST(req){
  const {message=""}=await req.json();
  return Response.json({
    reply:`ATULYA AI demo mode: I received “${message}”. Connect your preferred LLM provider in this server route using an environment variable; keep API keys on the server. I can be configured to explain model evidence, quantum workflow and benchmark results.`
  });
}