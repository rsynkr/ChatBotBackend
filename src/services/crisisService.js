// services/crisisService.js

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const HIGH_RISK_PATTERNS = [
  /kill(ing)?\s*(myself|me)/,
  /end(ing)?\s*(my\s*)?life/,
  /want\s*to\s*die/,
  /wanna\s*die/,
  /going\s*to\s*kill\s*myself/,
  /suicide/,
  /\bkys\b/
];

const MEDIUM_RISK_PATTERNS = [
  /dont\s*want\s*to\s*live/,
  /no\s*reason\s*to\s*live/,
  /life\s*is\s*pointless/,
  /i\s*give\s*up/,
  /cant\s*take\s*this\s*anymore/
];

const LOW_RISK_PATTERNS = [
  /hopeless/,
  /empty/,
  /tired/,
  /depressed/
];

function hasSelfReference(text) {
  return /\b(i|me|my|myself)\b/.test(text);
}

export const detectCrisis = (message) => {
  const text = normalizeText(message);

  // 🔴 HIGH → immediate return
  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(text) && hasSelfReference(text)) {
      return {
        isCrisis: true,
        severity: "high",
        score: 5
      };
    }
  }

  let score = 0;

  for (const pattern of MEDIUM_RISK_PATTERNS) {
    if (pattern.test(text) && hasSelfReference(text)) {
      score += 3;
      break;
    }
  }

  for (const pattern of LOW_RISK_PATTERNS) {
    if (pattern.test(text)) {
      score += 1;
      break;
    }
  }

  let severity = "none";
  let isCrisis = false;

  if (score >= 3) {
    severity = "medium";
  } else if (score >= 1) {
    severity = "low";
  }

  return {
    isCrisis,
    severity,
    score
  };
};

// 🔥 UPDATED RESPONSE LOGIC
export const getCrisisResponse = (severity = "medium") => {
  if (severity === "high") {
    return `I'm really sorry you're feeling this way. You are not alone.

This sounds very serious, and I strongly encourage you to reach out for immediate help.

📞 AASRA Helpline: +91-9820466726
🌐 http://www.aasra.info/

If possible, please contact someone you trust right now.`;
  }

  if (severity === "medium") {
    return `I'm really sorry you're feeling this way. It sounds like things have been really heavy for you.

You don’t have to go through this alone. Talking to someone you trust or a mental health professional could really help.

📞 AASRA Helpline: +91-9820466726`;
  }

  return `I'm sorry you're feeling this way. It might help to talk to someone you trust or take a small step to care for yourself.`;
};