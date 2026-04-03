import { useState } from 'react';
import { useSpecStore } from '../store/specStore';
import { STAGE_DEFINITIONS } from '../types';
import ChunkWarning from './ChunkWarning';
import ComplexityIndicator from './ComplexityIndicator';
import PRReview from './PRReview';
import './StageEditor.css';

const MIN_COMPLETE_LENGTH = 20;

export default function StageEditor() {
  const selectedSpecId = useSpecStore((s) => s.selectedSpecId);
  const spec = useSpecStore((s) => (s.selectedSpecId ? s.specs[s.selectedSpecId] : null));
  const activeStageIndex = useSpecStore((s) => s.activeStageIndex);
  const updateStageContent = useSpecStore((s) => s.updateStageContent);
  const completeStage = useSpecStore((s) => s.completeStage);
  const reopenStage = useSpecStore((s) => s.reopenStage);
  const createSpec = useSpecStore((s) => s.createSpec);
  const [showAddChild, setShowAddChild] = useState(false);
  const [childLabel, setChildLabel] = useState('');

  if (!spec || !selectedSpecId) {
    return (
      <div className="stage-editor stage-editor--empty">
        <p>Select a spec from the tree to begin.</p>
      </div>
    );
  }

  const stage = spec.stages[activeStageIndex];
  const def = STAGE_DEFINITIONS[activeStageIndex];
  const isCompleted = stage.status === 'completed';
  const isLocked = stage.status === 'locked';
  const canComplete = stage.content.length >= MIN_COMPLETE_LENGTH && !isCompleted && !isLocked;
  const isPRReview = stage.name === 'pr-review';

  const handleAddChild = () => {
    if (childLabel.trim()) {
      const childType = spec.type === 'page' ? 'feature' : 'sub-feature';
      createSpec(selectedSpecId, childType, childLabel.trim());
      setChildLabel('');
      setShowAddChild(false);
    }
  };

  return (
    <div className="stage-editor">
      <div className="stage-editor__spec-header">
        <div className="stage-editor__spec-info">
          <h2>{spec.label}</h2>
          <span className="stage-editor__spec-type">{spec.type}</span>
        </div>
        <button
          className="stage-editor__add-child"
          onClick={() => setShowAddChild(!showAddChild)}
          title={`Add child ${spec.type === 'page' ? 'feature' : 'sub-feature'}`}
        >
          + Add {spec.type === 'page' ? 'Feature' : 'Sub-feature'}
        </button>
      </div>

      {showAddChild && (
        <div className="stage-editor__add-child-form">
          <input
            autoFocus
            placeholder={`${spec.type === 'page' ? 'Feature' : 'Sub-feature'} name...`}
            value={childLabel}
            onChange={(e) => setChildLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddChild()}
          />
          <button onClick={handleAddChild}>Create</button>
        </div>
      )}

      <div className="stage-editor__stage-header">
        <h3>{def.label}</h3>
        <span className="stage-editor__role-badge">{stage.role}</span>
        {isCompleted && stage.completedAt && (
          <span className="stage-editor__completed-at">
            Completed {new Date(stage.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {isPRReview && stage.status === 'active' ? (
        <PRReview specId={selectedSpecId} />
      ) : (
        <>
          <ChunkWarning stageName={stage.name} content={stage.content} specId={selectedSpecId} />

          <div className={`stage-editor__textarea-wrapper ${
            stage.name === 'ideation' || stage.name === 'prd'
              ? `stage-editor__textarea-wrapper--${
                  stage.content.length > 400 ? 'warn' : 'ok'
                }`
              : ''
          }`}>
            <textarea
              className="stage-editor__textarea"
              placeholder={def.placeholder}
              value={stage.content}
              onChange={(e) => updateStageContent(selectedSpecId, activeStageIndex, e.target.value)}
              disabled={isLocked}
              rows={12}
            />
          </div>

          <div className="stage-editor__footer">
            <div className="stage-editor__footer-left">
              <span className="stage-editor__char-count">{stage.content.length} chars</span>
              <ComplexityIndicator content={stage.content} stageName={stage.name} />
            </div>

            <div className="stage-editor__footer-right">
              {isCompleted && (
                <button className="stage-editor__btn stage-editor__btn--reopen" onClick={() => reopenStage(selectedSpecId, activeStageIndex)}>
                  Re-edit (unlocks this stage, re-locks downstream)
                </button>
              )}
              {!isCompleted && !isLocked && (
                <button
                  className="stage-editor__btn stage-editor__btn--complete"
                  onClick={() => completeStage(selectedSpecId, activeStageIndex)}
                  disabled={!canComplete}
                >
                  Mark Complete →
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {isPRReview && spec.prAction === 'approved' && (
        <div className="stage-editor__footer">
          <div className="stage-editor__footer-left" />
          <div className="stage-editor__footer-right">
            <span className="stage-editor__merged">All stages complete</span>
          </div>
        </div>
      )}
    </div>
  );
}
