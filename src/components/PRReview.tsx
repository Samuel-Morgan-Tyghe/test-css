import { useState } from 'react';
import { useSpecStore } from '../store/specStore';
import './PRReview.css';

// Mock generated code for the prototype
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
+
+       setSortConfig({ column, direction });
+
+       const sorted = [...data].sort((a, b) => {
+         const aVal = String(a[column] ?? '');
+         const bVal = String(b[column] ?? '');
+         return direction === 'asc'
+           ? aVal.localeCompare(bVal)
+           : bVal.localeCompare(aVal);
+       });
+
+       onSort(sorted);
+     },
+     [data, onSort, sortConfig]
+   );
+
+   return (
+     <thead>
+       <tr>
+         {columns.map((col) => (
+           <th key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer' }}>
+             {col}
+             {sortConfig?.column === col && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
+           </th>
+         ))}
+       </tr>
+     </thead>
+   );
+ }`;

interface Props {
  specId: string;
}

export default function PRReview({ specId }: Props) {
  const spec = useSpecStore((s) => s.specs[specId]);
  const setPRAction = useSpecStore((s) => s.setPRAction);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  if (!spec) return null;

  if (spec.prAction === 'approved') {
    return (
      <div className="pr-review">
        <div className="pr-review__status pr-review__status--approved">
          ✓ Merged to develop
        </div>
        <div className="pr-review__diff">
          <pre>{MOCK_DIFF}</pre>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    setPRAction(specId, 'approved');
  };

  const handleRequestChanges = () => {
    if (!showCommentBox) {
      setShowCommentBox(true);
      return;
    }
    setPRAction(specId, 'changes-requested', comment);
    setComment('');
    setShowCommentBox(false);
  };

  return (
    <div className="pr-review">
      <div className="pr-review__header">
        <h3>Generated Code</h3>
        <p className="pr-review__hint">Review the AI-generated code below. Approve to merge or request changes.</p>
      </div>

      <div className="pr-review__diff">
        <div className="pr-review__filename">src/components/ColumnSorting.tsx</div>
        <pre>
          {MOCK_DIFF.split('\n').map((line, i) => (
            <div key={i} className={`pr-review__line ${line.startsWith('+') ? 'pr-review__line--added' : ''}`}>
              <span className="pr-review__lineno">{i + 1}</span>
              {line}
            </div>
          ))}
        </pre>
      </div>

      {showCommentBox && (
        <div className="pr-review__comment">
          <textarea
            placeholder="Describe the changes needed..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>
      )}

      <div className="pr-review__actions">
        <button className="pr-review__btn pr-review__btn--approve" onClick={handleApprove}>
          Approve
        </button>
        <button className="pr-review__btn pr-review__btn--changes" onClick={handleRequestChanges}>
          {showCommentBox ? 'Submit Changes Request' : 'Request Changes'}
        </button>
      </div>
    </div>
  );
}
