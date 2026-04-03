import { z } from "zod";

export const SpecType = z.enum(["PAGE", "FEATURE", "SUB_FEATURE"]);
export type SpecType = z.infer<typeof SpecType>;

export const StageName = z.enum([
  "IDEATION",
  "PRD",
  "DESIGN",
  "DEV_SPEC",
  "TEST_PLAN",
  "PR_REVIEW",
]);
export type StageName = z.infer<typeof StageName>;

export const StageStatus = z.enum(["LOCKED", "ACTIVE", "COMPLETED"]);
export type StageStatus = z.infer<typeof StageStatus>;

export const Role = z.enum(["PM", "DESIGNER", "DEVELOPER", "TESTER"]);
export type Role = z.infer<typeof Role>;

export const PRAction = z.enum(["APPROVED", "CHANGES_REQUESTED"]);
export type PRAction = z.infer<typeof PRAction>;

export const STAGE_DEFINITIONS = [
  { name: "IDEATION" as const, label: "Ideation", role: "PM" as const, placeholder: "Describe the goal, user need, and rough scope of this feature..." },
  { name: "PRD" as const, label: "PRD", role: "PM" as const, placeholder: "Define acceptance criteria, functional requirements, and edge cases..." },
  { name: "DESIGN" as const, label: "Design", role: "DESIGNER" as const, placeholder: "Describe the visual spec, component choices, and interaction patterns..." },
  { name: "DEV_SPEC" as const, label: "Dev Spec", role: "DEVELOPER" as const, placeholder: "Outline the technical approach, API contracts, and data model..." },
  { name: "TEST_PLAN" as const, label: "Test Plan", role: "TESTER" as const, placeholder: "List test cases and QA sign-off criteria..." },
  { name: "PR_REVIEW" as const, label: "PR Review", role: "DEVELOPER" as const, placeholder: "Review the generated code. Approve or request changes." },
] as const;

// API schemas
export const CreateSpecSchema = z.object({
  label: z.string().min(1).max(200),
  type: SpecType,
  parentId: z.string().nullable().optional(),
  workspaceId: z.string(),
});

export const UpdateStageSchema = z.object({
  content: z.string().optional(),
  action: z.enum(["save", "complete", "reopen"]).optional(),
});

export const SplitSpecSchema = z.object({
  label: z.string().min(1).max(200),
  excerptContent: z.string().optional(),
});

export const PRActionSchema = z.object({
  action: PRAction,
  comment: z.string().optional(),
});

// Response types
export interface StageResponse {
  id: string;
  name: string;
  content: string;
  status: string;
  order: number;
  completedAt: string | null;
  completedBy: string | null;
}

export interface SpecResponse {
  id: string;
  label: string;
  type: string;
  parentId: string | null;
  prAction: string | null;
  prComment: string;
  children: SpecResponse[];
  stages: StageResponse[];
  createdAt: string;
  updatedAt: string;
}
