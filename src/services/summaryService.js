// services/summaryService.js

const OLLAMA_URL = "http://localhost:11434/api/generate";

export async function summarizeConversation(recent, oldSummary = "") {
  try {
    const prompt = `
Summarize the user's situation briefly.

Focus on:
- main issue
- emotional state

Keep under 2 lines.

Previous summary:
${oldSummary}

New messages:
${recent.join("\n")}

Return only the summary.
`;

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

    const data = await res.json();
    return data.response.trim();

  } catch (err) {
    console.error("Summary error:", err.message);
    return oldSummary;
  }
}