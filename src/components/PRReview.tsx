"use client";

import { useState } from "react";
import { useSubmitPRAction } from "@/lib/queries";
import type { SpecResponse } from "@/types";
import styles from "./PRReview.module.css";

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
      <div className={styles.review}>
        <div className={styles.statusApproved}>{"\u2713"} Merged to develop</div>
        <div className={styles.diff}><pre>{MOCK_DIFF}</pre></div>
      </div>
    );
  }

  const handleApprove = () => {
    prAction.mutate({ specId: spec.id, action: "APPROVED" });
  };

  const handleRequestChanges = () => {
    if (!showCommentBox) { setShowCommentBox(true); return; }
    prAction.mutate({ specId: spec.id, action: "CHANGES_REQUESTED", comment });
    setComment("");
    setShowCommentBox(false);
  };

  return (
    <div className={styles.review}>
      <div className={styles.header}>
        <h3>Generated Code</h3>
        <p className={styles.hint}>Review the AI-generated code below. Approve to merge or request changes.</p>
      </div>

      <div className={styles.diff}>
        <div className={styles.filename}>src/components/ColumnSorting.tsx</div>
        <pre>
          {MOCK_DIFF.split("\n").map((line, i) => (
            <div key={i} className={`${styles.line} ${line.startsWith("+") ? styles.lineAdded : ""}`}>
              <span className={styles.lineno}>{i + 1}</span>
              {line}
            </div>
          ))}
        </pre>
      </div>

      {showCommentBox && (
        <textarea
          className={styles.commentBox}
          placeholder="Describe the changes needed..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      )}

      <div className={styles.actions}>
        <button className={styles.approveBtn} onClick={handleApprove}>Approve</button>
        <button className={styles.changesBtn} onClick={handleRequestChanges}>
          {showCommentBox ? "Submit Changes Request" : "Request Changes"}
        </button>
      </div>
    </div>
  );
}
