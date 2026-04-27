const OLLAMA_URL = "http://localhost:11434/api/generate";

console.log("🔥 AI SERVICE LOADED");

// 🔥 fallback
function fallback() {
  return {
    emotion: "neutral",
    intensity: "low",
    response: "I'm here for you. Tell me what's going on."
  };
}

// 🔥 regenerate (strong)
async function regenerateResponse(userInput) {
  const prompt = `
User: "${userInput}"

Give a helpful and specific response.

Rules:
- DO NOT say "I hear what you are saying"
- DO NOT say "let's explore"
- DO NOT ask generic questions
- Give one practical suggestion
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
  return data.response?.trim();
}

// 🔥 MAIN FUNCTION
export async function generateAIResponse(userInput) {
  console.log("🚀 generateAIResponse CALLED");

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `User: ${userInput}\nRespond helpfully.`,
        stream: false
      })
    });

    const data = await res.json();

    let response = data.response || "";
    console.log("RAW:", response);

    const lower = response.toLowerCase();

    const isBad =
      !response ||
      lower.includes("i hear what you are saying") ||
      lower.includes("let's explore") ||
      lower.includes("tell me more") ||
      response.length < 40;

    // 🔥 FORCE FIX
    if (isBad) {
      console.log("🚨 BAD RESPONSE → regenerating");

      const better = await regenerateResponse(userInput);

      if (better && better.length > 20) {
        response = better;
        console.log("✅ FIXED:", response);
      } else {
        response =
          "That sounds tough. Try focusing on one small step instead of everything at once.";
      }
    }

    return {
      emotion: "neutral",
      intensity: "low",
      response
    };

  } catch (err) {
    console.error("AI ERROR:", err);
    return fallback();
  }
}