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

export async function handleChat(req, res) {
  const { message, userId = "default" } = req.body;

  // Rule-based
  const rule = detectCrisis(message);
  if (rule.isCrisis) {
    return res.json({
      type: "crisis",
      severity: rule.severity,
      response: getCrisisResponse(rule.severity)
    });
  }

  // LLM-based (only HIGH triggers)
  const llm = await detectCrisisLLM(message);
  if (llm.severity === "high") {
    return res.json({
      type: "crisis",
      severity: "high",
      response: getCrisisResponse("high")
    });
  }

  const memory = await getMemory(userId);

  const ai = await generateAIResponse(message, memory);

  await addMessage(userId, "User", message);
  await addMessage(userId, "Assistant", ai.response);

  if (shouldSummarize(userId)) {
    const updated = await getMemory(userId);
    const summary = await summarizeConversation(updated.recent, updated.summary);
    await updateSummary(userId, summary);
  }

  const recommendation = getRecommendation(ai.emotion, ai.intensity);

  res.json({
    type: "normal",
    emotion: ai,
    response: ai.response,
    recommendation
  });
}