"use client";

import { shouldShowChunkWarning } from "@/utils/chunkAnalysis";
import { useSplitSpec } from "@/lib/queries";
import styles from "./ChunkWarning.module.css";

interface Props {
  stageName: string;
  content: string;
  specId: string;
}

export default function ChunkWarning({ stageName, content, specId }: Props) {
  const splitMutation = useSplitSpec();
  const { level, message } = shouldShowChunkWarning(stageName, content);

  if (!level) return null;

  const handleSplit = () => {
    const newLabel = prompt("Name for the new sub-feature:");
    if (newLabel) {
      splitMutation.mutate({ specId, label: newLabel });
    }
  };

  return (
    <div className={`${styles.warning} ${level === "high" ? styles.warningHigh : styles.warningMedium}`}>
      <span className={styles.icon}>{level === "high" ? "\u26A0" : "\u2191"}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.splitBtn} onClick={handleSplit}>Split ↗</button>
    </div>
  );
}
