"use client";

import { shouldShowChunkWarning } from "@/utils/chunkAnalysis";
import { useSplitSpec } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-[13px] mb-3",
      level === "high"
        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
        : "bg-indigo-500/10 border border-indigo-500/30 text-indigo-300"
    )}>
      <span className="text-sm shrink-0">{level === "high" ? "\u26A0" : "\u2191"}</span>
      <span className="flex-1">{message}</span>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-6 text-xs border-current",
          level === "high" ? "text-amber-400 hover:bg-amber-500/10" : "text-indigo-300 hover:bg-indigo-500/10"
        )}
        onClick={handleSplit}
      >
        Split ↗
      </Button>
    </div>
  );
}
