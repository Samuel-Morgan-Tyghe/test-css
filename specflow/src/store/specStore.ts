import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Spec, SpecType, PRAction } from '../types';
import { createDefaultStages } from '../types';

interface SpecStore {
  specs: Record<string, Spec>;
  selectedSpecId: string | null;
  activeStageIndex: number;

  // Actions
  selectSpec: (id: string) => void;
  setActiveStage: (index: number) => void;
  createSpec: (parentId: string | null, type: SpecType, label: string) => string;
  updateStageContent: (specId: string, stageIndex: number, content: string) => void;
  completeStage: (specId: string, stageIndex: number) => void;
  reopenStage: (specId: string, stageIndex: number) => void;
  splitSpec: (specId: string, newLabel: string, excerptContent?: string) => string;
  setPRAction: (specId: string, action: PRAction, comment?: string) => void;
  renameSpec: (specId: string, label: string) => void;
  deleteSpec: (specId: string) => void;
}

function createSpec(parentId: string | null, type: SpecType, label: string): Spec {
  return {
    id: uuid(),
    parentId,
    label,
    type,
    stages: createDefaultStages(),
    prAction: null,
    prComment: '',
    children: [],
    createdAt: new Date().toISOString(),
  };
}

// Seed data
const rootSpec = createSpec(null, 'page', 'Home Page');
const featureSpec = createSpec(rootSpec.id, 'feature', 'Data Table');
rootSpec.children.push(featureSpec.id);
const subFeature1 = createSpec(featureSpec.id, 'sub-feature', 'Column Sorting');
const subFeature2 = createSpec(featureSpec.id, 'sub-feature', 'Row Filtering');
featureSpec.children.push(subFeature1.id, subFeature2.id);

const initialSpecs: Record<string, Spec> = {
  [rootSpec.id]: rootSpec,
  [featureSpec.id]: featureSpec,
  [subFeature1.id]: subFeature1,
  [subFeature2.id]: subFeature2,
};

export const useSpecStore = create<SpecStore>((set, get) => ({
  specs: initialSpecs,
  selectedSpecId: subFeature1.id,
  activeStageIndex: 0,

  selectSpec: (id) => {
    const spec = get().specs[id];
    if (!spec) return;
    const activeIdx = spec.stages.findIndex((s) => s.status === 'active');
    set({ selectedSpecId: id, activeStageIndex: activeIdx >= 0 ? activeIdx : spec.stages.length - 1 });
  },

  setActiveStage: (index) => set({ activeStageIndex: index }),

  createSpec: (parentId, type, label) => {
    const spec = createSpec(parentId, type, label);
    set((state) => {
      const newSpecs = { ...state.specs, [spec.id]: spec };
      if (parentId && newSpecs[parentId]) {
        newSpecs[parentId] = {
          ...newSpecs[parentId],
          children: [...newSpecs[parentId].children, spec.id],
        };
      }
      return { specs: newSpecs, selectedSpecId: spec.id, activeStageIndex: 0 };
    });
    return spec.id;
  },

  updateStageContent: (specId, stageIndex, content) => {
    set((state) => {
      const spec = state.specs[specId];
      if (!spec) return state;
      const stages = spec.stages.map((s, i) => (i === stageIndex ? { ...s, content } : s));
      return { specs: { ...state.specs, [specId]: { ...spec, stages } } };
    });
  },

  completeStage: (specId, stageIndex) => {
    set((state) => {
      const spec = state.specs[specId];
      if (!spec) return state;
      const stages = spec.stages.map((s, i) => {
        if (i === stageIndex) {
          return { ...s, status: 'completed' as const, completedAt: new Date().toISOString(), completedBy: s.role };
        }
        if (i === stageIndex + 1 && s.status === 'locked') {
          return { ...s, status: 'active' as const };
        }
        return s;
      });
      return {
        specs: { ...state.specs, [specId]: { ...spec, stages } },
        activeStageIndex: Math.min(stageIndex + 1, stages.length - 1),
      };
    });
  },

  reopenStage: (specId, stageIndex) => {
    set((state) => {
      const spec = state.specs[specId];
      if (!spec) return state;
      const stages = spec.stages.map((s, i) => {
        if (i === stageIndex) {
          return { ...s, status: 'active' as const, completedAt: null, completedBy: null };
        }
        if (i > stageIndex) {
          return { ...s, status: 'locked' as const, completedAt: null, completedBy: null };
        }
        return s;
      });
      return {
        specs: { ...state.specs, [specId]: { ...spec, stages, prAction: null, prComment: '' } },
        activeStageIndex: stageIndex,
      };
    });
  },

  splitSpec: (specId, newLabel, excerptContent) => {
    const spec = get().specs[specId];
    if (!spec) return '';
    const childType: SpecType = spec.type === 'page' ? 'feature' : 'sub-feature';
    const newSpec = createSpec(spec.parentId, childType, newLabel);
    if (excerptContent) {
      newSpec.stages[0].content = excerptContent;
    }
    set((state) => {
      const newSpecs = { ...state.specs, [newSpec.id]: newSpec };
      if (spec.parentId && newSpecs[spec.parentId]) {
        newSpecs[spec.parentId] = {
          ...newSpecs[spec.parentId],
          children: [...newSpecs[spec.parentId].children, newSpec.id],
        };
      }
      return { specs: newSpecs, selectedSpecId: newSpec.id, activeStageIndex: 0 };
    });
    return newSpec.id;
  },

  setPRAction: (specId, action, comment) => {
    set((state) => {
      const spec = state.specs[specId];
      if (!spec) return state;
      if (action === 'changes-requested') {
        // Return to dev-spec stage
        const stages = spec.stages.map((s, i) => {
          if (i === 3) return { ...s, status: 'active' as const, completedAt: null, completedBy: null };
          if (i > 3) return { ...s, status: 'locked' as const, completedAt: null, completedBy: null };
          return s;
        });
        return {
          specs: {
            ...state.specs,
            [specId]: { ...spec, stages, prAction: action, prComment: comment || '' },
          },
          activeStageIndex: 3,
        };
      }
      // Approved
      return {
        specs: {
          ...state.specs,
          [specId]: { ...spec, prAction: action, prComment: '' },
        },
      };
    });
  },

  renameSpec: (specId, label) => {
    set((state) => {
      const spec = state.specs[specId];
      if (!spec) return state;
      return { specs: { ...state.specs, [specId]: { ...spec, label } } };
    });
  },

  deleteSpec: (specId) => {
    set((state) => {
      const spec = state.specs[specId];
      if (!spec) return state;

      // Collect all descendant IDs
      const toDelete = new Set<string>();
      const queue = [specId];
      while (queue.length) {
        const id = queue.pop()!;
        toDelete.add(id);
        const s = state.specs[id];
        if (s) queue.push(...s.children);
      }

      const newSpecs = { ...state.specs };
      toDelete.forEach((id) => delete newSpecs[id]);

      // Remove from parent
      if (spec.parentId && newSpecs[spec.parentId]) {
        newSpecs[spec.parentId] = {
          ...newSpecs[spec.parentId],
          children: newSpecs[spec.parentId].children.filter((c) => c !== specId),
        };
      }

      return {
        specs: newSpecs,
        selectedSpecId: state.selectedSpecId === specId ? null : state.selectedSpecId,
      };
    });
  },
}));
