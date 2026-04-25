// services/llmCrisisService.js

import { extractJSON } from "./utils.js";

const OLLAMA_URL = "http://localhost:11434/api/generate";

export async function detectCrisisLLM(message) {
  try {
    const prompt = `
You are a strict JSON generator.

Detect suicidal or self-harm intent.

Return ONLY JSON:
{"severity":"none|low|medium|high"}

Classification rules:

- "high" → explicit intent to harm self
  (e.g. "I want to kill myself")

- "medium" → indirect suicidal ideation
  (e.g. "better off without me", "can't do this anymore")

- "low" → emotional distress ONLY (no suicidal thinking)
  (e.g. "I failed my exam", "I feel not good enough")

- "none" → neutral

IMPORTANT:
- DO NOT classify sadness or failure as crisis
- Self-esteem issues alone are NOT crisis
- Be conservative

STRICT RULES:
- Only JSON
- No explanation
- No extra text

Message: "${message}"
`;

    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false
      })
    });

    const data = await res.json();

    console.log("LLM CRISIS RAW:", data.response);

    let parsed;
    try {
      parsed = extractJSON(data.response);
    } catch {
      return { isCrisis: false, severity: "none" };
    }

    let severity = String(parsed.severity || "").toLowerCase();

    if (!["none", "low", "medium", "high"].includes(severity)) {
      severity = "none";
    }

    return {
      isCrisis: severity === "high",
      severity
    };

  } catch (err) {
    console.error("LLM crisis error:", err.message);

    return {
      isCrisis: false,
      severity: "none"
    };
  }
}