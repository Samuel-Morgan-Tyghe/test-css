export type ComplexityLevel = "atomic" | "getting-broad" | "consider-splitting";

const ADDITIVE_KEYWORDS = [
  "and", "also", "additionally", "plus", "as well as",
  "along with", "together with", "in addition", "moreover",
  "furthermore", "both", "multiple", "several", "various",
];

export function countAdditiveKeywords(text: string): number {
  const lower = text.toLowerCase();
  return ADDITIVE_KEYWORDS.reduce((count, kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    const matches = lower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

export function getComplexityLevel(text: string): ComplexityLevel {
  const len = text.length;
  const kwCount = countAdditiveKeywords(text);

  if (len > 400 && kwCount >= 2) return "consider-splitting";
  if (len > 300 && kwCount >= 2) return "getting-broad";
  if (len > 400) return "getting-broad";

  return "atomic";
}

export function shouldShowChunkWarning(
  stageName: string,
  content: string,
): { level: "medium" | "high" | null; message: string } {
  if (stageName !== "IDEATION" && stageName !== "PRD") {
    return { level: null, message: "" };
  }

  const complexity = getComplexityLevel(content);

  if (complexity === "consider-splitting") {
    return { level: "high", message: "This spec looks too broad — consider splitting it into smaller sub-features." };
  }
  if (complexity === "getting-broad") {
    return { level: "medium", message: "Consider splitting this spec into smaller, more atomic pieces." };
  }

  return { level: null, message: "" };
}
