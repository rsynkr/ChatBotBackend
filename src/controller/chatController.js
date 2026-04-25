import { detectCrisis, getCrisisResponse } from '../services/crisisService.js';
import { detectCrisisLLM } from '../services/llmCrisisService.js';
import { generateAIResponse } from '../services/aiService.js';
import { getRecommendation } from '../services/recommendationService.js';

import {
  getMemory,
  addMessage,
  updateSummary,
  shouldSummarize
} from '../services/memoryService.js';

import { summarizeConversation } from '../services/summaryService.js';

export async function handleChat(req, res, next) {
  try {
    const { message, userId = "default" } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    // 🚨 1. Rule-based crisis detection (HIGH only)
    const ruleCrisis = detectCrisis(message);

    if (ruleCrisis.isCrisis) {
      return res.json({
        type: 'crisis',
        severity: ruleCrisis.severity,
        response: getCrisisResponse(ruleCrisis.severity),
        action: "seek_help_immediately"
      });
    }

    // 🧠 2. LLM-based detection (ONLY HIGH triggers crisis)
    const llmCrisis = await detectCrisisLLM(message);

    if (llmCrisis.severity === "high") {
      return res.json({
        type: 'crisis',
        severity: llmCrisis.severity,
        response: getCrisisResponse(llmCrisis.severity),
        action: "seek_help_immediately"
      });
    }

    // 🧠 3. Memory
    const memory = await getMemory(userId);

    // 🤖 4. AI response
    const aiResult = await generateAIResponse(message, memory);

    // 💾 5. Store conversation
    await addMessage(userId, "User", message);
    await addMessage(userId, "Assistant", aiResult.response);

    // 🧠 6. Summarize memory
    if (shouldSummarize(userId)) {
      const updatedMemory = await getMemory(userId);

      const newSummary = await summarizeConversation(
        updatedMemory.recent,
        updatedMemory.summary
      );

      await updateSummary(userId, newSummary);
    }

    // 🎯 7. Recommendation
    const recommendation = getRecommendation(
      aiResult.emotion,
      aiResult.intensity
    );

    // ✅ 8. Final response
    return res.json({
      type: 'normal',
      emotion: {
        emotion: aiResult.emotion,
        intensity: aiResult.intensity
      },
      response: aiResult.response,
      recommendation
    });

  } catch (err) {
    next(err);
  }
}