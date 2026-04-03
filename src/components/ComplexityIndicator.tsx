"use client";

import { getComplexityLevel, type ComplexityLevel } from "@/utils/chunkAnalysis";
import styles from "./ComplexityIndicator.module.css";

const labels: Record<ComplexityLevel, string> = {
  "atomic": "\u2713 atomic",
  "getting-broad": "\u2191 getting broad",
  "consider-splitting": "\u26A0 consider splitting",
};

export default function ComplexityIndicator({ content, stageName }: { content: string; stageName: string }) {
  if (stageName !== "IDEATION" && stageName !== "PRD") return null;

  const level = getComplexityLevel(content);

  return (
    <span className={`${styles.indicator} ${styles[level.replace("-", "_")]}`}>
      {labels[level]}
    </span>
  );
}
