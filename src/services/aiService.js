import { extractJSON } from "./utils.js";
import { isGenericResponse } from "./responseFilter.js";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const ALLOWED_INTENSITY = ["low", "medium", "high"];

function mapEmotion(emotion) {
  let e = (emotion || "").toLowerCase().trim();

  if (e.includes("|") || e.includes("/") || e.includes(",")) {
    e = e.split(/[\|\/,]/)[0].trim();
  }

  if (["sad","disappointed","hopeless","worthless"].includes(e)) return "sad";
  if (["stressed","overwhelmed","burnout"].includes(e)) return "stressed";
  if (["anxious","nervous","worried"].includes(e)) return "anxious";
  if (["angry","frustrated"].includes(e)) return "angry";
  if (["happy","excited"].includes(e)) return "happy";

  return "neutral";
}

function buildPrompt(userInput, memory) {
  return `
You are a mental health support assistant.

CONTEXT:
${memory.summary}

RECENT:
${memory.recent.join("\n")}

Return ONLY JSON:
{
  "emotion": "ONE of: anxious, sad, angry, stressed, happy, neutral",
  "intensity": "low, medium, high",
  "response": "..."
}

User: ${userInput}
`;
}

async function regenerateResponse(userInput, memory, emotion, intensity) {
  const prompt = `
Improve this response.

User: ${userInput}
Emotion: ${emotion}
Intensity: ${intensity}

Make it:
- specific
- practical
- non-generic

Return ONLY text.
`;

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3", prompt, stream: false })
  });

  const data = await res.json();
  return data.response.trim();
}

export async function generateAIResponse(userInput, memory) {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: buildPrompt(userInput, memory),
        stream: false
      })
    });

    const data = await res.json();
    console.log("RAW AI:", data.response);

    let parsed;
    try {
      parsed = extractJSON(data.response);
    } catch {
      return fallback();
    }

    let { emotion, intensity, response } = parsed;

    emotion = mapEmotion(emotion);

    if (!ALLOWED_INTENSITY.includes(intensity)) intensity = "low";

    let finalResponse = response;

    if (isGenericResponse(finalResponse)) {
      console.log("⚠️ Improving generic response");

      try {
        const better = await regenerateResponse(userInput, memory, emotion, intensity);
        if (better.length > 20) finalResponse = better;
      } catch {}
    }

    return { emotion, intensity, response: finalResponse };

  } catch {
    return fallback();
  }
}

function fallback() {
  return {
    emotion: "neutral",
    intensity: "low",
    response: "I'm here for you. Do you want to talk more?"
  };
}