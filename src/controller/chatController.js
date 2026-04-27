import { generateAIResponse } from "../services/aiService.js";
import { detectCrisis, getCrisisResponse } from "../services/crisisService.js";

// 🔥 HANDLE CHAT
export async function handleChat(req, res) {
  try {
    const { message, userId = "default" } = req.body;

    console.log("📩 MESSAGE:", message);

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Valid message is required" });
    }

    // 🚨 STEP 1: CRISIS CHECK
    const crisis = detectCrisis(message);

    if (crisis.isCrisis) {
      return res.json({
        type: "crisis",
        severity: crisis.severity,
        response: getCrisisResponse(crisis.severity)
      });
    }

    // 🤖 STEP 2: AI RESPONSE
    const ai = await generateAIResponse(message);

    return res.json({
      type: "normal",
      emotion: {
        emotion: ai.emotion,
        intensity: ai.intensity
      },
      response: ai.response
    });

  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: "Server error" });
  }
}


// 🔥 END CHAT (SIMPLE VERSION)
export async function endChat(req, res) {
  try {
    const { userId = "default" } = req.body;

    console.log("🛑 Ending chat for:", userId);

    return res.json({
      type: "session_end",
      therapy: {
        support_level: "low",
        therapy_suggestion: false,
        reason: "Session ended successfully."
      },
      summary: ""
    });

  } catch (err) {
    console.error("❌ EndChat error:", err);
    res.status(500).json({ error: "Failed to end chat" });
  }
}