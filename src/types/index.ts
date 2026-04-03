export type SpecType = 'page' | 'feature' | 'sub-feature';

export type StageName = 'ideation' | 'prd' | 'design' | 'dev-spec' | 'test-plan' | 'pr-review';

export type Role = 'PM' | 'Designer' | 'Developer' | 'Tester';

export type StageStatus = 'locked' | 'active' | 'completed';

export type ComplexityLevel = 'atomic' | 'getting-broad' | 'consider-splitting';

export type PRAction = 'approved' | 'changes-requested' | null;

export interface Stage {
  name: StageName;
  label: string;
  role: Role;
  content: string;
  status: StageStatus;
  completedAt: string | null;
  completedBy: string | null;
}

export interface Spec {
  id: string;
  parentId: string | null;
  label: string;
  type: SpecType;
  stages: Stage[];
  prAction: PRAction;
  prComment: string;
  children: string[];
  createdAt: string;
}

export const STAGE_DEFINITIONS: { name: StageName; label: string; role: Role; placeholder: string }[] = [
  {
    name: 'ideation',
    label: 'Ideation',
    role: 'PM',
    placeholder: 'Describe the goal, user need, and rough scope of this feature...',
  },
  {
    name: 'prd',
    label: 'PRD',
    role: 'PM',
    placeholder: 'Define acceptance criteria, functional requirements, and edge cases...',
  },
  {
    name: 'design',
    label: 'Design',
    role: 'Designer',
    placeholder: 'Describe the visual spec, component choices, and interaction patterns...',
  },
  {
    name: 'dev-spec',
    label: 'Dev Spec',
    role: 'Developer',
    placeholder: 'Outline the technical approach, API contracts, and data model...',
  },
  {
    name: 'test-plan',
    label: 'Test Plan',
    role: 'Tester',
    placeholder: 'List test cases and QA sign-off criteria...',
  },
  {
    name: 'pr-review',
    label: 'PR Review',
    role: 'Developer',
    placeholder: 'Review the generated code. Approve or request changes.',
  },
];

export function createDefaultStages(): Stage[] {
  return STAGE_DEFINITIONS.map((def, i) => ({
    name: def.name,
    label: def.label,
    role: def.role,
    content: '',
    status: i === 0 ? 'active' : 'locked',
    completedAt: null,
    completedBy: null,
  }));
}
