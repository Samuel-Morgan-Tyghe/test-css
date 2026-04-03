"use client";

import { useState } from "react";
import { useSubmitPRAction } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SpecResponse } from "@/types";
import { cn } from "@/lib/utils";

const MOCK_DIFF = `// src/components/ColumnSorting.tsx
+ import React, { useState, useCallback } from 'react';
+
+ interface SortConfig {
+   column: string;
+   direction: 'asc' | 'desc';
+ }
+
+ interface ColumnSortingProps {
+   columns: string[];
+   data: Record<string, unknown>[];
+   onSort: (sorted: Record<string, unknown>[]) => void;
+ }
+
+ export function ColumnSorting({ columns, data, onSort }: ColumnSortingProps) {
+   const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
+
+   const handleSort = useCallback(
+     (column: string) => {
+       const direction =
+         sortConfig?.column === column && sortConfig.direction === 'asc'
+           ? 'desc'
+           : 'asc';
+       setSortConfig({ column, direction });
+       const sorted = [...data].sort((a, b) => {
+         const aVal = String(a[column] ?? '');
+         const bVal = String(b[column] ?? '');
+         return direction === 'asc'
+           ? aVal.localeCompare(bVal)
+           : bVal.localeCompare(aVal);
+       });
+       onSort(sorted);
+     },
+     [data, onSort, sortConfig]
+   );
+
+   return (
+     <thead>
+       <tr>
+         {columns.map((col) => (
+           <th key={col} onClick={() => handleSort(col)}>
+             {col}
+             {sortConfig?.column === col && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
+           </th>
+         ))}
+       </tr>
+     </thead>
+   );
+ }`;

export default function PRReview({ spec }: { spec: SpecResponse }) {
  const prAction = useSubmitPRAction();
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  if (spec.prAction === "APPROVED") {
    return (
      <div className="flex flex-col gap-4">
        <div className="px-4 py-3 rounded-md text-sm font-semibold bg-specflow-cyan/10 border border-specflow-cyan/30 text-specflow-cyan">
          {"\u2713"} Merged to develop
        </div>
        <div className="bg-specflow-surface border border-specflow-border rounded-lg overflow-hidden">
          <pre className="m-0 p-0 font-mono text-[13px] leading-relaxed overflow-x-auto">{MOCK_DIFF}</pre>
        </div>
      </div>
    );
  }

  const handleApprove = () => prAction.mutate({ specId: spec.id, action: "APPROVED" });
  const handleRequestChanges = () => {
    if (!showCommentBox) { setShowCommentBox(true); return; }
    prAction.mutate({ specId: spec.id, action: "CHANGES_REQUESTED", comment });
    setComment("");
    setShowCommentBox(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Generated Code</h3>
        <p className="text-[13px] text-specflow-text-muted">Review the AI-generated code below. Approve to merge or request changes.</p>
      </div>

      <div className="bg-specflow-surface border border-specflow-border rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-specflow-surface-alt border-b border-specflow-border text-xs font-semibold text-specflow-text font-mono">
          src/components/ColumnSorting.tsx
        </div>
        <pre className="m-0 p-0 font-mono text-[13px] leading-relaxed overflow-x-auto">
          {MOCK_DIFF.split("\n").map((line, i) => (
            <div key={i} className={cn("px-3 whitespace-pre", line.startsWith("+") && "bg-green-500/10 text-green-400")}>
              <span className="inline-block w-10 text-right mr-3 text-specflow-text-muted select-none">{i + 1}</span>
              {line}
            </div>
          ))}
        </pre>
      </div>

      {showCommentBox && (
        <Textarea
          placeholder="Describe the changes needed..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="bg-specflow-surface-alt border-specflow-border-light text-specflow-text"
        />
      )}

      <div className="flex gap-2">
        <Button className="bg-green-700 hover:bg-green-600 text-white" onClick={handleApprove}>Approve</Button>
        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={handleRequestChanges}>
          {showCommentBox ? "Submit Changes Request" : "Request Changes"}
        </Button>
      </div>
    </div>
  );
}
