// services/memoryService.js

import Memory from "../models/Memory.js";

// 🔹 In-memory store (same as before)
const userMemory = new Map();

const MAX_RECENT = 4;
const SUMMARY_TRIGGER = 6;

// 🔹 Get memory (fast → fallback to DB)
export async function getMemory(userId) {
  // 1. Try memory first
  if (userMemory.has(userId)) {
    return userMemory.get(userId);
  }

  // 2. If not found, load from DB
  let dbMemory = await Memory.findOne({ userId });

  if (!dbMemory) {
    dbMemory = await Memory.create({
      userId,
      summary: "",
      recent: []
    });
  }

  const memory = {
    summary: dbMemory.summary,
    recent: dbMemory.recent
  };

  // cache it
  userMemory.set(userId, memory);

  return memory;
}

// 🔹 Add message (update BOTH memory + DB)
export async function addMessage(userId, role, content) {
  const memory = await getMemory(userId);

  memory.recent.push(`${role}: ${content}`);

  if (memory.recent.length > MAX_RECENT) {
    memory.recent.shift();
  }

  userMemory.set(userId, memory);

  // 🔥 async DB update (non-blocking)
  Memory.findOneAndUpdate(
    { userId },
    { recent: memory.recent },
    { upsert: true }
  ).catch(err => console.error("DB save error:", err.message));
}

// 🔹 Update summary (both memory + DB)
export async function updateSummary(userId, summary) {
  const memory = await getMemory(userId);

  memory.summary = summary;

  userMemory.set(userId, memory);

  // async DB update
  Memory.findOneAndUpdate(
    { userId },
    { summary },
    { upsert: true }
  ).catch(err => console.error("DB summary error:", err.message));
}

// 🔹 Summarization trigger (same behavior)
export function shouldSummarize(userId) {
  const memory = userMemory.get(userId);
  return memory && memory.recent.length >= SUMMARY_TRIGGER;
}