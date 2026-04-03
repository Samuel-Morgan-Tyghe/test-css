import { useState } from 'react';
import { useSpecStore } from '../store/specStore';
import type { Spec, SpecType } from '../types';
import './SpecTree.css';

function TypeBadge({ type }: { type: SpecType }) {
  const labels: Record<SpecType, string> = {
    page: 'Page',
    feature: 'Feature',
    'sub-feature': 'Sub',
  };
  return <span className={`type-badge type-badge--${type}`}>{labels[type]}</span>;
}

function StageProgress({ spec }: { spec: Spec }) {
  const completed = spec.stages.filter((s) => s.status === 'completed').length;
  const total = spec.stages.length;
  const allDone = completed === total;
  return (
    <span className={`stage-progress ${allDone ? 'stage-progress--done' : ''}`}>
      {allDone ? '✓' : `${completed}/${total}`}
    </span>
  );
}

function TreeNode({ specId, depth }: { specId: string; depth: number }) {
  const spec = useSpecStore((s) => s.specs[specId]);
  const selectedSpecId = useSpecStore((s) => s.selectedSpecId);
  const selectSpec = useSpecStore((s) => s.selectSpec);
  const [expanded, setExpanded] = useState(true);

  if (!spec) return null;

  const hasChildren = spec.children.length > 0;
  const isSelected = selectedSpecId === specId;

  return (
    <div className="tree-node">
      <div
        className={`tree-node__row ${isSelected ? 'tree-node__row--selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => selectSpec(specId)}
      >
        {hasChildren ? (
          <button
            className="tree-node__toggle"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="tree-node__toggle tree-node__toggle--leaf">·</span>
        )}
        <TypeBadge type={spec.type} />
        <span className="tree-node__label">{spec.label}</span>
        <StageProgress spec={spec} />
      </div>
      {hasChildren && expanded && (
        <div className="tree-node__children">
          {spec.children.map((childId) => (
            <TreeNode key={childId} specId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SpecTree() {
  const specs = useSpecStore((s) => s.specs);
  const createSpec = useSpecStore((s) => s.createSpec);
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const rootSpecs = Object.values(specs).filter((s) => s.parentId === null);

  const handleCreate = () => {
    if (newLabel.trim()) {
      createSpec(null, 'page', newLabel.trim());
      setNewLabel('');
      setShowCreate(false);
    }
  };

  return (
    <aside className="spec-tree">
      <div className="spec-tree__header">
        <h2>Specs</h2>
        <button className="spec-tree__add" onClick={() => setShowCreate(!showCreate)} title="New Page">
          +
        </button>
      </div>
      {showCreate && (
        <div className="spec-tree__create">
          <input
            autoFocus
            placeholder="Page name..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button onClick={handleCreate}>Create</button>
        </div>
      )}
      <div className="spec-tree__list">
        {rootSpecs.map((spec) => (
          <TreeNode key={spec.id} specId={spec.id} depth={0} />
        ))}
      </div>
    </aside>
  );
}
