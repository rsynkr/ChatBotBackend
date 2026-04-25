// services/llmService.js

const OLLAMA_URL = "http://localhost:11434/api/generate";

function buildPrompt(userInput, emotion, intensity, history) {
  return `
You are a mental health support assistant.

STRICT RULES:
- Do NOT diagnose
- Do NOT give medical advice
- Avoid generic advice
- Be specific to the user

CONVERSATION HISTORY:
${history.join("\n")}

CURRENT EMOTION: ${emotion}
INTENSITY: ${intensity}

TONE RULES:
- low → light and supportive
- medium → balanced and helpful
- high → calm, grounding, more serious

RESPONSE FORMAT:
1. Acknowledge the feeling
2. Give ONE relevant suggestion
3. Ask ONE thoughtful follow-up

User: ${userInput}
Assistant:
`;
}

export async function generateResponse(userInput, emotion, intensity, history = []) {
  try {
    const prompt = buildPrompt(userInput, emotion, intensity, history);

    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama API error: ${res.status}`);
    }

    const data = await res.json();

    if (!data || !data.response) {
      throw new Error("Invalid response from Ollama");
    }

    return data.response.trim();

  } catch (err) {
    console.error("LLM ERROR:", err.message);

    return "I'm here for you. Do you want to tell me more about what's been going on?";
  }
}