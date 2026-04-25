// services/aiService.js

import { extractJSON } from "./utils.js";

const OLLAMA_URL = "http://localhost:11434/api/generate";

const ALLOWED_INTENSITY = ["low", "medium", "high"];

// 🔥 Smart emotion mapping + multi-emotion handling
function mapEmotion(emotion) {
  let e = (emotion || "").toLowerCase().trim();

  // handle multiple emotions like "anxious|sad"
  if (e.includes("|") || e.includes("/") || e.includes(",")) {
    e = e.split(/[\|\/,]/)[0].trim();
  }

  if (["sad", "disappointed", "hopeless", "worthless", "down"].includes(e)) return "sad";
  if (["stressed", "overwhelmed", "burnout", "pressure"].includes(e)) return "stressed";
  if (["anxious", "nervous", "worried", "overthinking"].includes(e)) return "anxious";
  if (["angry", "frustrated", "irritated", "annoyed"].includes(e)) return "angry";
  if (["happy", "excited", "content", "good"].includes(e)) return "happy";

  return "neutral";
}

function buildPrompt(userInput, memory) {
  return `
You are a mental health support assistant.

CONTEXT SUMMARY:
${memory.summary || "None"}

RECENT MESSAGES:
${memory.recent.join("\n")}

Task:
1. Detect ONE emotion
2. Detect intensity (low, medium, high)
3. Give a helpful response

Return ONLY JSON:

{
  "emotion": "ONE of: anxious, sad, angry, stressed, happy, neutral",
  "intensity": "low, medium, or high",
  "response": "..."
}

STRICT RULES:
- Emotion must be exactly ONE word
- Do NOT combine emotions
- Do NOT use symbols like | / ,
- No explanation
- No extra text

User: ${userInput}
`;
}

export async function generateAIResponse(userInput, memory) {
  try {
    const prompt = buildPrompt(userInput, memory);

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

    console.log("RAW AI OUTPUT:", data.response);

    let parsed;

    try {
      parsed = extractJSON(data.response);
    } catch {
      console.log("⚠️ Invalid structured output → fallback used");

      return {
        emotion: "neutral",
        intensity: "low",
        response: "I'm here for you. Do you want to talk more about what's going on?"
      };
    }

    let { emotion, intensity, response } = parsed;

    // 🔥 FIXED: map instead of reject
    emotion = mapEmotion(emotion);

    // normalize intensity
    intensity = String(intensity || "").toLowerCase().trim();
    if (!ALLOWED_INTENSITY.includes(intensity)) {
      intensity = "low";
    }

    return {
      emotion,
      intensity,
      response: String(response || "").trim()
    };

  } catch (err) {
    console.error("AI ERROR:", err.message);

    return {
      emotion: "neutral",
      intensity: "low",
      response: "I'm here for you. Do you want to talk more?"
    };
  }
}