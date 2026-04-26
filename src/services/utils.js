export function extractJSON(text) {
  try {
    const start = text.indexOf("{");
    let end = text.lastIndexOf("}");

    if (start !== -1 && end === -1) {
      text = text + "}";
      end = text.length - 1;
    }

    if (start === -1) throw new Error();

    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error("Invalid JSON");
  }
}