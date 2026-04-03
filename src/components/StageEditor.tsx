"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $selectedSpecId, $activeStageIndex } from "@/stores/ui";
import { useSpec, useUpdateStage, useCreateSpec } from "@/lib/queries";
import { STAGE_DEFINITIONS } from "@/types";
import ChunkWarning from "./ChunkWarning";
import ComplexityIndicator from "./ComplexityIndicator";
import PRReview from "./PRReview";
import styles from "./StageEditor.module.css";

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

  // Sync local content when spec/stage changes
  useEffect(() => {
    if (spec && spec.stages[activeIdx]) {
      setLocalContent(spec.stages[activeIdx].content);
    }
  }, [spec, activeIdx]);

  // Debounced save
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
      <div className={`${styles.editor} ${styles.editorEmpty}`}>
        <p>Select a spec from the tree to begin.</p>
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
    // Save content first, then complete
    updateStage.mutate(
      { specId: selectedId, stageIndex: activeIdx, data: { content: localContent, action: "complete" } },
      { onSuccess: () => $activeStageIndex.set(Math.min(activeIdx + 1, spec.stages.length - 1)) },
    );
  };

  const handleReopen = () => {
    updateStage.mutate(
      { specId: selectedId, stageIndex: activeIdx, data: { action: "reopen" } },
    );
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
    <div className={styles.editor}>
      <div className={styles.specHeader}>
        <div className={styles.specInfo}>
          <h2 className={styles.specTitle}>{spec.label}</h2>
          <span className={styles.specType}>{spec.type.replace("_", "-").toLowerCase()}</span>
        </div>
        <button className={styles.addChildBtn} onClick={() => setShowAddChild(!showAddChild)}>
          + Add {spec.type === "PAGE" ? "Feature" : "Sub-feature"}
        </button>
      </div>

      {showAddChild && (
        <div className={styles.addChildForm}>
          <input
            autoFocus
            placeholder={`${spec.type === "PAGE" ? "Feature" : "Sub-feature"} name...`}
            value={childLabel}
            onChange={(e) => setChildLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddChild()}
            className={styles.addChildInput}
          />
          <button onClick={handleAddChild} className={styles.addChildSubmit}>Create</button>
        </div>
      )}

      <div className={styles.stageHeader}>
        <h3>{def.label}</h3>
        <span className={styles.roleBadge}>{def.role}</span>
        {isCompleted && stage.completedAt && (
          <span className={styles.completedAt}>
            Completed {new Date(stage.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {isPRReview && stage.status === "ACTIVE" ? (
        <PRReview spec={spec} />
      ) : (
        <>
          <ChunkWarning stageName={stage.name} content={localContent} specId={selectedId} />

          <div className={`${styles.textareaWrapper} ${
            (stage.name === "IDEATION" || stage.name === "PRD") && localContent.length > 400
              ? styles.textareaWrapperWarn : ""
          }`}>
            <textarea
              className={styles.textarea}
              placeholder={def.placeholder}
              value={localContent}
              onChange={(e) => handleContentChange(e.target.value)}
              disabled={isLocked}
              rows={12}
            />
          </div>

          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <span className={styles.charCount}>{localContent.length} chars</span>
              <ComplexityIndicator content={localContent} stageName={stage.name} />
            </div>
            <div className={styles.footerRight}>
              {isCompleted && (
                <button className={styles.reopenBtn} onClick={handleReopen}>
                  Re-edit (unlocks this stage, re-locks downstream)
                </button>
              )}
              {!isCompleted && !isLocked && (
                <button className={styles.completeBtn} onClick={handleComplete} disabled={!canComplete}>
                  Mark Complete →
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {isPRReview && spec.prAction === "APPROVED" && (
        <div className={styles.footer}>
          <div className={styles.footerLeft} />
          <div className={styles.footerRight}>
            <span className={styles.merged}>All stages complete</span>
          </div>
        </div>
      )}
    </div>
  );
}
