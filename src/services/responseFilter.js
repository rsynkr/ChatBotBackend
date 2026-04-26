const GENERIC_PATTERNS = [
  "i understand how you feel",
  "i'm here for you",
  "that sounds tough",
  "you are not alone",
  "do you want to talk more"
];

export function isGenericResponse(text) {
  const lower = text.toLowerCase();
  return GENERIC_PATTERNS.some(p => lower.includes(p));
}