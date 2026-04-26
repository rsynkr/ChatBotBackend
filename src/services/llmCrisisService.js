import { extractJSON } from "./utils.js";

const OLLAMA_URL = "http://localhost:11434/api/generate";

export async function detectCrisisLLM(message) {
  const prompt = `
Return ONLY JSON:
{"severity":"none|low|medium|high"}

Rules:
- high = explicit self-harm intent
- medium = indirect ideation
- low = emotional distress
- none = normal

Message: "${message}"
`;

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ model:"llama3", prompt, stream:false })
    });

    const data = await res.json();
    const parsed = extractJSON(data.response);

    return {
      severity: parsed.severity,
      isCrisis: parsed.severity === "high"
    };

  } catch {
    return { severity: "none", isCrisis: false };
  }
}