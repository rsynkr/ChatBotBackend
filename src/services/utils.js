// services/utils.js

export function extractJSON(text) {
  try {
    const start = text.indexOf("{");
    let end = text.lastIndexOf("}");

    // 🔥 If closing brace missing → fix it
    if (start !== -1 && end === -1) {
      end = text.length;
      text = text + "}";
    }

    if (start === -1) {
      throw new Error("No JSON found");
    }

    const jsonString = text.slice(start, end + 1);

    return JSON.parse(jsonString);

  } catch (err) {
    throw new Error("Invalid JSON");
  }
}