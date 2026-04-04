"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { SpecType } from "@/types";

export const WORKSPACE_ID_KEY = "specflow-workspace-id";

function useWorkspaceId() {
  // For now, stored in localStorage after seed
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WORKSPACE_ID_KEY);
}

// --- Queries ---

export function useSpecs() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: ["specs", workspaceId],
    queryFn: () => api.fetchSpecs(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useSpec(id: string | null) {
  return useQuery({
    queryKey: ["spec", id],
    queryFn: () => api.fetchSpec(id!),
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateSpec() {
  const qc = useQueryClient();
  const workspaceId = useWorkspaceId();

  return useMutation({
    mutationFn: (data: { label: string; type: SpecType; parentId?: string | null }) =>
      api.createSpec({ ...data, workspaceId: workspaceId! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specs"] });
    },
  });
}

export function useRenameSpec() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) => api.renameSpec(id, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specs"] });
    },
  });
}

export function useDeleteSpec() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSpec(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specs"] });
    },
  });
}

export function useUpdateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ specId, stageIndex, data }: { specId: string; stageIndex: number; data: { content?: string; action?: "save" | "complete" | "reopen" } }) =>
      api.updateStage(specId, stageIndex, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["spec", vars.specId] });
      qc.invalidateQueries({ queryKey: ["specs"] });
    },
  });
}

export function useSplitSpec() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ specId, label, excerptContent }: { specId: string; label: string; excerptContent?: string }) =>
      api.splitSpec(specId, { label, excerptContent }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specs"] });
    },
  });
}

export function useSubmitPRAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ specId, action, comment }: { specId: string; action: "APPROVED" | "CHANGES_REQUESTED"; comment?: string }) =>
      api.submitPRAction(specId, { action, comment }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["spec", vars.specId] });
      qc.invalidateQueries({ queryKey: ["specs"] });
    },
  });
}

export function useSeedWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.seedWorkspace(),
    onSuccess: (workspace) => {
      localStorage.setItem(WORKSPACE_ID_KEY, workspace.id);
      qc.invalidateQueries({ queryKey: ["specs"] });
    },
  });
}
