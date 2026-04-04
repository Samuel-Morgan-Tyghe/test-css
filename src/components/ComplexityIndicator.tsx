"use client";

import { getComplexityLevel, type ComplexityLevel } from "@/utils/chunkAnalysis";
import { cn } from "@/lib/utils";

const labels: Record<ComplexityLevel, string> = {
  "atomic": "\u2713 atomic",
  "getting-broad": "\u2191 getting broad",
  "consider-splitting": "\u26A0 consider splitting",
};

const levelStyles: Record<ComplexityLevel, string> = {
  "atomic": "text-specflow-cyan",
  "getting-broad": "text-indigo-300",
  "consider-splitting": "text-amber-400",
};

export default function ComplexityIndicator({ content, stageName }: { content: string; stageName: string }) {
  if (stageName !== "IDEATION" && stageName !== "PRD") return null;

  const level = getComplexityLevel(content);

  return (
    <span className={cn("text-xs font-medium", levelStyles[level])}>
      {labels[level]}
    </span>
  );
}
