export function getTherapyRecommendation(emotion, intensity) {
  const negative = ["sad", "anxious", "stressed", "angry"];

  if (intensity === "high" && negative.includes(emotion)) {
    return {
      support_level: "high",
      therapy_suggestion: true,
      reason: "You're experiencing intense emotional distress."
    };
  }

  if (intensity === "medium" && negative.includes(emotion)) {
    return {
      support_level: "medium",
      therapy_suggestion: true,
      reason: "You seem to be going through ongoing emotional difficulty."
    };
  }

  return {
    support_level: "low",
    therapy_suggestion: false,
    reason: "Your current state seems manageable with self-care."
  };
}