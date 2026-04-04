"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $selectedSpecId, $activeStageIndex } from "@/stores/ui";
import { useSpec, useUpdateStage, useCreateSpec } from "@/lib/queries";
import { STAGE_DEFINITIONS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ChunkWarning from "./ChunkWarning";
import ComplexityIndicator from "./ComplexityIndicator";
import PRReview from "./PRReview";

const MIN_COMPLETE_LENGTH = 20;

export default function StageEditor() {
  const selectedId = useStore($selectedSpecId);
  const activeIdx = useStore($activeStageIndex);
  const { data: spec } = useSpec(selectedId);
  const updateStage = useUpdateStage();
  const createSpec = useCreateSpec();

  const [localContent, setLocalContent] = useState("");
  const [showAddChild, setShowAddChild] = useState(false);
  const [childLabel, setChildLabel] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (spec && spec.stages[activeIdx]) {
      setLocalContent(spec.stages[activeIdx].content);
    }
  }, [spec, activeIdx]);

  const handleContentChange = useCallback((value: string) => {
    setLocalContent(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (selectedId) {
        updateStage.mutate({ specId: selectedId, stageIndex: activeIdx, data: { content: value } });
      }
    }, 500);
  }, [selectedId, activeIdx, updateStage]);

  if (!spec || !selectedId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-specflow-text-muted text-[15px]">Select a spec from the tree to begin.</p>
      </div>
    );
  }

  const stage = spec.stages[activeIdx];
  if (!stage) return null;

  const def = STAGE_DEFINITIONS[activeIdx];
  const isCompleted = stage.status === "COMPLETED";
  const isLocked = stage.status === "LOCKED";
  const canComplete = localContent.length >= MIN_COMPLETE_LENGTH && !isCompleted && !isLocked;
  const isPRReview = stage.name === "PR_REVIEW";

  const handleComplete = () => {
    updateStage.mutate(
      { specId: selectedId, stageIndex: activeIdx, data: { content: localContent, action: "complete" } },
      { onSuccess: () => $activeStageIndex.set(Math.min(activeIdx + 1, spec.stages.length - 1)) },
    );
  };

  const handleReopen = () => {
    updateStage.mutate({ specId: selectedId, stageIndex: activeIdx, data: { action: "reopen" } });
  };

  const handleAddChild = () => {
    if (childLabel.trim()) {
      const childType = spec.type === "PAGE" ? "FEATURE" : "SUB_FEATURE";
      createSpec.mutate(
        { label: childLabel.trim(), type: childType, parentId: selectedId },
        { onSuccess: (newSpec) => { $selectedSpecId.set(newSpec.id); $activeStageIndex.set(0); } },
      );
      setChildLabel("");
      setShowAddChild(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
      {/* Spec header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-xl font-bold text-white">{spec.label}</h2>
          <span className="text-xs text-specflow-text-muted capitalize">{spec.type.replace("_", "-").toLowerCase()}</span>
        </div>
        <Button variant="outline" size="sm" className="text-xs border-specflow-border-light text-specflow-text hover:border-specflow-cyan hover:text-specflow-cyan" onClick={() => setShowAddChild(!showAddChild)}>
          + Add {spec.type === "PAGE" ? "Feature" : "Sub-feature"}
        </Button>
      </div>

      {showAddChild && (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder={`${spec.type === "PAGE" ? "Feature" : "Sub-feature"} name...`}
            value={childLabel}
            onChange={(e) => setChildLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddChild()}
            className="bg-specflow-surface-alt border-specflow-border-light"
          />
          <Button size="sm" onClick={handleAddChild}>Create</Button>
        </div>
      )}

      {/* Stage header */}
      <div className="flex items-center gap-2.5">
        <h3 className="text-base font-semibold text-specflow-text">{def.label}</h3>
        <Badge variant="secondary" className="bg-secondary text-specflow-cyan text-[11px] font-semibold uppercase tracking-wider">
          {def.role}
        </Badge>
        {isCompleted && stage.completedAt && (
          <span className="text-xs text-specflow-text-muted ml-auto">
            Completed {new Date(stage.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* PR Review or Editor */}
      {isPRReview && stage.status === "ACTIVE" ? (
        <PRReview spec={spec} />
      ) : (
        <>
          <ChunkWarning stageName={stage.name} content={localContent} specId={selectedId} />

          <div className={cn(
            "rounded-lg border transition-colors",
            (stage.name === "IDEATION" || stage.name === "PRD") && localContent.length > 400
              ? "border-amber-500/40"
              : "border-specflow-border-light"
          )}>
            <Textarea
              placeholder={def.placeholder}
              value={localContent}
              onChange={(e) => handleContentChange(e.target.value)}
              disabled={isLocked}
              rows={12}
              className="bg-specflow-surface-alt border-0 text-specflow-text text-sm leading-relaxed resize-y rounded-lg disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-specflow-text-muted/70"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-specflow-text-muted">{localContent.length} chars</span>
              <ComplexityIndicator content={localContent} stageName={stage.name} />
            </div>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Button variant="outline" size="sm" className="text-xs border-specflow-border-light text-specflow-text hover:border-destructive hover:text-destructive" onClick={handleReopen}>
                  Re-edit (unlocks this stage, re-locks downstream)
                </Button>
              )}
              {!isCompleted && !isLocked && (
                <Button size="sm" onClick={handleComplete} disabled={!canComplete}>
                  Mark Complete →
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {isPRReview && spec.prAction === "APPROVED" && (
        <div className="flex items-center justify-end">
          <span className="text-[13px] font-semibold text-specflow-cyan">All stages complete</span>
        </div>
      )}
    </div>
  );
}
