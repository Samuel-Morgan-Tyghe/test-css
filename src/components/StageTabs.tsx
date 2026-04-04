"use client";

import { useStore } from "@nanostores/react";
import { $selectedSpecId, $activeStageIndex } from "@/stores/ui";
import { useSpec } from "@/lib/queries";
import { STAGE_DEFINITIONS } from "@/types";
import { cn } from "@/lib/utils";

export default function StageTabs() {
  const selectedId = useStore($selectedSpecId);
  const activeIdx = useStore($activeStageIndex);
  const { data: spec } = useSpec(selectedId);

  if (!spec) return null;

  return (
    <div className="flex border-b border-specflow-border bg-specflow-surface px-4 overflow-x-auto">
      {spec.stages.map((stage, i) => {
        const def = STAGE_DEFINITIONS[i];
        const isActive = i === activeIdx;
        const isLocked = stage.status === "LOCKED";
        const isCompleted = stage.status === "COMPLETED";

        return (
          <button
            key={stage.name}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 pt-3 pb-2.5 border-b-2 border-transparent transition-all whitespace-nowrap relative",
              isActive && "border-b-specflow-cyan",
              isLocked && "opacity-35 cursor-not-allowed",
              !isLocked && "cursor-pointer hover:bg-specflow-surface-alt"
            )}
            onClick={() => !isLocked && $activeStageIndex.set(i)}
            disabled={isLocked}
          >
            <span className={cn(
              "text-[13px] font-semibold",
              isCompleted ? "text-specflow-cyan" : isActive ? "text-white" : "text-specflow-text"
            )}>
              {def.label}
            </span>
            <span className="text-[10px] text-specflow-text-muted uppercase tracking-wider">
              {def.role}
            </span>
            {isCompleted && (
              <span className="absolute top-1.5 right-1.5 text-[10px] text-specflow-cyan">{"\u2713"}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
