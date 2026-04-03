"use client";

import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $selectedSpecId, $activeStageIndex } from "@/stores/ui";
import { useSpecs, useCreateSpec } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SpecResponse } from "@/types";

const TYPE_BADGE_STYLES: Record<string, string> = {
  PAGE: "bg-cyan-900/50 text-specflow-cyan hover:bg-cyan-900/50",
  FEATURE: "bg-purple-900/40 text-purple-400 hover:bg-purple-900/40",
  SUB_FEATURE: "bg-green-900/30 text-green-400 hover:bg-green-900/30",
};

const TYPE_LABELS: Record<string, string> = {
  PAGE: "Page",
  FEATURE: "Feature",
  SUB_FEATURE: "Sub",
};

function StageProgress({ spec }: { spec: SpecResponse }) {
  const completed = spec.stages.filter((s) => s.status === "COMPLETED").length;
  const total = spec.stages.length;
  const allDone = completed === total;
  return (
    <span className={cn("text-[11px] shrink-0", allDone ? "text-specflow-cyan" : "text-specflow-text-muted")}>
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
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 cursor-pointer rounded-md mx-1 transition-colors",
          isSelected ? "bg-secondary" : "hover:bg-specflow-surface-alt"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <button
            className="w-4 h-4 flex items-center justify-center text-specflow-text-muted text-xs shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? "\u25BE" : "\u25B8"}
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center text-specflow-border-light text-xs shrink-0">&middot;</span>
        )}
        <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4 font-semibold uppercase tracking-wider", TYPE_BADGE_STYLES[spec.type])}>
          {TYPE_LABELS[spec.type] ?? spec.type}
        </Badge>
        <span className={cn("text-[13px] truncate flex-1", isSelected ? "text-white" : "text-specflow-text")}>
          {spec.label}
        </span>
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
    <aside className="w-[280px] min-w-[280px] bg-specflow-surface border-r border-specflow-border flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b border-specflow-border">
        <h2 className="text-sm font-semibold text-white">Specs</h2>
        <Button variant="outline" size="icon" className="w-7 h-7 border-specflow-border-light text-specflow-cyan" onClick={() => setShowCreate(!showCreate)}>
          +
        </Button>
      </div>
      {showCreate && (
        <div className="flex gap-1.5 p-2 border-b border-specflow-border">
          <Input
            autoFocus
            placeholder="Page name..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-7 text-[13px] bg-specflow-surface-alt border-specflow-border-light"
          />
          <Button size="sm" className="h-7 text-xs" onClick={handleCreate}>Create</Button>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {specs?.map((spec) => (
            <TreeNode key={spec.id} spec={spec} depth={0} />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
