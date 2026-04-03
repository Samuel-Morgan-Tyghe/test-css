"use client";

import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $selectedSpecId, $activeStageIndex } from "@/stores/ui";
import { useSpecs, useCreateSpec } from "@/lib/queries";
import type { SpecResponse } from "@/types";
import styles from "./SpecTree.module.css";

function TypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = { PAGE: "Page", FEATURE: "Feature", SUB_FEATURE: "Sub" };
  return <span className={`${styles.badge} ${styles[`badge_${type}`]}`}>{labels[type] ?? type}</span>;
}

function StageProgress({ spec }: { spec: SpecResponse }) {
  const completed = spec.stages.filter((s) => s.status === "COMPLETED").length;
  const total = spec.stages.length;
  const allDone = completed === total;
  return (
    <span className={`${styles.progress} ${allDone ? styles.progressDone : ""}`}>
      {allDone ? "\u2713" : `${completed}/${total}`}
    </span>
  );
}

function TreeNode({ spec, depth }: { spec: SpecResponse; depth: number }) {
  const selectedId = useStore($selectedSpecId);
  const [expanded, setExpanded] = useState(true);

  const hasChildren = spec.children && spec.children.length > 0;
  const isSelected = selectedId === spec.id;

  const handleSelect = () => {
    $selectedSpecId.set(spec.id);
    const activeIdx = spec.stages.findIndex((s) => s.status === "ACTIVE");
    $activeStageIndex.set(activeIdx >= 0 ? activeIdx : spec.stages.length - 1);
  };

  return (
    <div>
      <div
        className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <button className={styles.toggle} onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? "\u25BE" : "\u25B8"}
          </button>
        ) : (
          <span className={`${styles.toggle} ${styles.toggleLeaf}`}>&middot;</span>
        )}
        <TypeBadge type={spec.type} />
        <span className={styles.label}>{spec.label}</span>
        <StageProgress spec={spec} />
      </div>
      {hasChildren && expanded && spec.children.map((child) => (
        <TreeNode key={child.id} spec={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function SpecTree() {
  const { data: specs } = useSpecs();
  const createSpec = useCreateSpec();
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const handleCreate = () => {
    if (newLabel.trim()) {
      createSpec.mutate({ label: newLabel.trim(), type: "PAGE" });
      setNewLabel("");
      setShowCreate(false);
    }
  };

  return (
    <aside className={styles.tree}>
      <div className={styles.header}>
        <h2 className={styles.title}>Specs</h2>
        <button className={styles.addBtn} onClick={() => setShowCreate(!showCreate)} title="New Page">+</button>
      </div>
      {showCreate && (
        <div className={styles.createForm}>
          <input
            autoFocus
            placeholder="Page name..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className={styles.createInput}
          />
          <button onClick={handleCreate} className={styles.createBtn}>Create</button>
        </div>
      )}
      <div className={styles.list}>
        {specs?.map((spec) => (
          <TreeNode key={spec.id} spec={spec} depth={0} />
        ))}
      </div>
    </aside>
  );
}
