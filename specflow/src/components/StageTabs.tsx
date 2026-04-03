import { useSpecStore } from '../store/specStore';
import { STAGE_DEFINITIONS } from '../types';
import './StageTabs.css';

export default function StageTabs() {
  const selectedSpecId = useSpecStore((s) => s.selectedSpecId);
  const spec = useSpecStore((s) => (s.selectedSpecId ? s.specs[s.selectedSpecId] : null));
  const activeStageIndex = useSpecStore((s) => s.activeStageIndex);
  const setActiveStage = useSpecStore((s) => s.setActiveStage);

  if (!spec || !selectedSpecId) return null;

  return (
    <div className="stage-tabs">
      {spec.stages.map((stage, i) => {
        const def = STAGE_DEFINITIONS[i];
        const isActive = i === activeStageIndex;
        const isLocked = stage.status === 'locked';
        const isCompleted = stage.status === 'completed';

        return (
          <button
            key={stage.name}
            className={`stage-tab ${isActive ? 'stage-tab--active' : ''} ${isLocked ? 'stage-tab--locked' : ''} ${isCompleted ? 'stage-tab--completed' : ''}`}
            onClick={() => !isLocked && setActiveStage(i)}
            disabled={isLocked}
          >
            <span className="stage-tab__name">{def.label}</span>
            <span className="stage-tab__role">{stage.role}</span>
            {isCompleted && <span className="stage-tab__check">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
