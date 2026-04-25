// services/emotionService.js

const OLLAMA_URL = "http://localhost:11434/api/generate";

const ALLOWED_EMOTIONS = ["anxious", "sad", "angry", "stressed", "happy", "neutral"];
const ALLOWED_INTENSITY = ["low", "medium", "high"];

// Extract JSON safely
function extractJSON(text) {
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}

export async function detectEmotion(text) {
  try {
    const prompt = `
You are a strict JSON generator.

Classify the user's mental state.

Return:
- emotion: anxious, sad, angry, stressed, happy, neutral
- intensity: low, medium, high
- confidence: 0 to 1

Output ONLY valid JSON.

Example:
{"emotion":"stressed","intensity":"high","confidence":0.85}

Rules:
- No explanation
- No extra text

Text: "${text}"
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

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.status}`);
    }

    const data = await res.json();

    console.log("RAW EMOTION OUTPUT:", data.response);

    let parsed;
    try {
      parsed = extractJSON(data.response);
    } catch {
      throw new Error("Invalid JSON from model");
    }

    let { emotion, intensity, confidence } = parsed;

    // normalize emotion
    emotion = String(emotion || "").toLowerCase().trim();
    if (!ALLOWED_EMOTIONS.includes(emotion)) {
      emotion = "neutral";
    }

    // normalize intensity
    intensity = String(intensity || "").toLowerCase().trim();
    if (!ALLOWED_INTENSITY.includes(intensity)) {
      intensity = "low";
    }

    // normalize confidence
    confidence = Number(confidence);
    if (isNaN(confidence)) confidence = 0.5;
    confidence = Math.max(0, Math.min(1, confidence));

    return { emotion, intensity, confidence };

  } catch (err) {
    console.error("Emotion detection error:", err.message);

    return {
      emotion: "neutral",
      intensity: "low",
      confidence: 0.0
    };
  }
}