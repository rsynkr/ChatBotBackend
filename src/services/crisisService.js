// 🔥 Normalize input
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// 🔴 HIGH RISK (intent-based, permissive)
const HIGH_RISK_PATTERNS = [
  /kill(ing)?.*(my\s*self|myself|me)/,
  /end(ing)?.*(life|it|everything)/,
  /i\s*am\s*ending/,
  /i\s*am\s*done/,
  /cant\s*go\s*on/,
  /want\s*to\s*die/,
  /wanna\s*die/,
  /suicide/,
  /\bkys\b/
];

// 🟠 MEDIUM
const MEDIUM_RISK_PATTERNS = [
  /dont\s*want\s*to\s*live/,
  /no\s*reason\s*to\s*live/,
  /life\s*is\s*pointless/,
  /i\s*give\s*up/,
  /cant\s*take\s*this\s*anymore/,
  /everything\s*would\s*be\s*better\s*without\s*me/
];

// 🟢 LOW
const LOW_RISK_PATTERNS = [
  /hopeless/,
  /empty/,
  /tired/,
  /depressed/,
  /worthless/,
  /overwhelmed/
];

function hasSelfReference(text) {
  return /\b(i|me|my|myself)\b/.test(text);
}

// 🔥 MAIN
export const detectCrisis = (message) => {
  const text = normalizeText(message);

  // 🔴 HIGH → immediate
  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(text)) {
      return { isCrisis: true, severity: "high", score: 5 };
    }
  }

  let score = 0;

  // 🟠 MEDIUM
  for (const pattern of MEDIUM_RISK_PATTERNS) {
    if (pattern.test(text) && hasSelfReference(text)) {
      score += 3;
      break;
    }
  }

  // 🟢 LOW
  for (const pattern of LOW_RISK_PATTERNS) {
    if (pattern.test(text)) {
      score += 1;
      break;
    }
  }

  let severity = "none";
  let isCrisis = false;

  if (score >= 3) severity = "medium";
  else if (score >= 1) severity = "low";

  return { isCrisis, severity, score };
};

// 🔥 RESPONSE
export const getCrisisResponse = (severity = "high") => {
  if (severity === "high") {
    return `I'm really sorry you're feeling this way. You are not alone.

This sounds very serious, and I strongly encourage you to reach out for immediate help.

📞 AASRA Helpline: +91-9820466726
🌐 http://www.aasra.info/

If possible, please contact someone you trust right now.`;
  }

  if (severity === "medium") {
    return `I'm really sorry you're feeling this way. It sounds like things have been really heavy for you.

You don’t have to go through this alone. Talking to someone you trust could really help.

📞 AASRA Helpline: +91-9820466726`;
  }

  return `I'm here for you. You don’t have to handle this alone.`;
};