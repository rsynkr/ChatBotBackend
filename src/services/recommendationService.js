export function getRecommendation(emotion) {
  const map = {
    sad: "Try writing down what you're feeling—it can help process emotions.",
    anxiety: "Take slow deep breaths for a few minutes.",
    stress: "Step away for a short walk or break.",
    neutral: "Keep taking care of your mental well-being."
  };

  return map[emotion] || map.neutral;
}