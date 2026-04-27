import { generateAIResponse } from "../services/aiService.js";
import { detectCrisis, getCrisisResponse } from "../services/crisisService.js";
import { getMemory, addMessage } from "../services/memoryService.js";


export async function handleChat(req, res) {
  try {
    const { message, userId = "default" } = req.body;

    console.log("📩 USER:", message);

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Valid message is required" });
    }


    const crisis = detectCrisis(message);
    if (crisis.isCrisis) {
      console.log("🚨 REAL-TIME CRISIS");

    
      await addMessage(userId, "User", message);

      return res.json({
        type: "crisis",
        severity: crisis.severity,
        response: getCrisisResponse(crisis.severity)
      });
    }

    
    const memory = await getMemory(userId);

    
    const ai = await generateAIResponse(message, memory);

    
    await addMessage(userId, "User", message);
    await addMessage(userId, "Assistant", ai.response);

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



export async function endChat(req, res) {
  try {
    const { userId = "default" } = req.body;

    const memory = await getMemory(userId);
    const messages = memory.recent || [];


    const userMessages = messages
      .filter(m => m.startsWith("User:"))
      .map(m => m.replace("User:", "").trim());

    console.log("🧠 USER MESSAGES:", userMessages);

    
    for (const msg of userMessages) {
      const crisis = detectCrisis(msg);

      if (crisis.isCrisis) {
        console.log("🚨 CRISIS FOUND:", msg);

        return res.json({
          type: "crisis",
          severity: "high",
          response: getCrisisResponse("high")
        });
      }
    }

    
    const combined = userMessages.join(" ").toLowerCase();

    if (
      /ending it|kill myself|want to die|suicide|cant go on|i am done/.test(combined)
    ) {
      console.log("🚨 CRISIS (REGEX BACKUP)");

      return res.json({
        type: "crisis",
        severity: "high",
        response: getCrisisResponse("high")
      });
    }

   
    let score = 0;

    const patterns = [
      /stressed/,
      /anxious/,
      /overwhelmed/,
      /sad/,
      /depressed/,
      /breakup/,
      /lost job/,
      /not good enough/
    ];

    userMessages.forEach(msg => {
      const lower = msg.toLowerCase();
      patterns.forEach(p => {
        if (p.test(lower)) score++;
      });
    });

    let support_level = "low";
    let therapy_suggestion = false;
    let reason = "";

    if (score >= 3) {
      support_level = "high";
      therapy_suggestion = true;
      reason =
        "You've been going through significant emotional distress. Professional support is strongly recommended.";
    } else if (score >= 1) {
      support_level = "medium";
      therapy_suggestion = true;
      reason =
        "You're dealing with emotional difficulty. Talking to someone could help.";
    } else {
      support_level = "low";
      therapy_suggestion = false;
      reason =
        "Your current state seems manageable with self-care.";
    }

    return res.json({
      type: "session_end",
      therapy: {
        support_level,
        therapy_suggestion,
        reason
      },
      summary: memory.summary || ""
    });

  } catch (err) {
    console.error("❌ EndChat error:", err);
    res.status(500).json({ error: "Failed to analyze chat" });
  }
}