// services/responseFilter.js

const GENERIC_PATTERNS = [
  "i understand how you feel",
  "i'm here for you",
  "that sounds tough",
  "you are not alone",
  "do you want to talk more",
  "i hear what you are saying",
  "let's explore that",
  "tell me more about that",
  "what do you think is contributing",
  "how does that make you feel"
];

export function isGenericResponse(text) {
  const lower = text.toLowerCase();

  return GENERIC_PATTERNS.some(pattern =>
    lower.includes(pattern)
  );
}