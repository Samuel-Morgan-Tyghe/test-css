"use client";

import { useStore } from "@nanostores/react";
import { $selectedSpecId, $activeStageIndex } from "@/stores/ui";
import { useSpec } from "@/lib/queries";
import { STAGE_DEFINITIONS } from "@/types";
import styles from "./StageTabs.module.css";

export default function StageTabs() {
  const selectedId = useStore($selectedSpecId);
  const activeIdx = useStore($activeStageIndex);
  const { data: spec } = useSpec(selectedId);

  if (!spec) return null;

  return (
    <div className={styles.tabs}>
      {spec.stages.map((stage, i) => {
        const def = STAGE_DEFINITIONS[i];
        const isActive = i === activeIdx;
        const isLocked = stage.status === "LOCKED";
        const isCompleted = stage.status === "COMPLETED";

        return (
          <button
            key={stage.name}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""} ${isLocked ? styles.tabLocked : ""} ${isCompleted ? styles.tabCompleted : ""}`}
            onClick={() => !isLocked && $activeStageIndex.set(i)}
            disabled={isLocked}
          >
            <span className={styles.tabName}>{def.label}</span>
            <span className={styles.tabRole}>{def.role}</span>
            {isCompleted && <span className={styles.tabCheck}>{"\u2713"}</span>}
          </button>
        );
      })}
    </div>
  );
}
