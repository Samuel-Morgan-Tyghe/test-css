import type { SpecResponse, SpecType } from "@/types";

const BASE = "/api";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

// Specs
export function fetchSpecs(workspaceId: string) {
  return fetchJSON<SpecResponse[]>(`/specs?workspaceId=${workspaceId}`);
}

export function fetchSpec(id: string) {
  return fetchJSON<SpecResponse>(`/specs/${id}`);
}

export function createSpec(data: { label: string; type: SpecType; parentId?: string | null; workspaceId: string }) {
  return fetchJSON<SpecResponse>("/specs", { method: "POST", body: JSON.stringify(data) });
}

export function renameSpec(id: string, label: string) {
  return fetchJSON<SpecResponse>(`/specs/${id}`, { method: "PATCH", body: JSON.stringify({ label }) });
}

export function deleteSpec(id: string) {
  return fetchJSON<{ ok: boolean }>(`/specs/${id}`, { method: "DELETE" });
}

// Stages
export function updateStage(specId: string, stageIndex: number, data: { content?: string; action?: "save" | "complete" | "reopen" }) {
  return fetchJSON<SpecResponse>(`/specs/${specId}/stages/${stageIndex}`, { method: "PATCH", body: JSON.stringify(data) });
}

// Split
export function splitSpec(specId: string, data: { label: string; excerptContent?: string }) {
  return fetchJSON<SpecResponse>(`/specs/${specId}/split`, { method: "POST", body: JSON.stringify(data) });
}

// PR Action
export function submitPRAction(specId: string, data: { action: "APPROVED" | "CHANGES_REQUESTED"; comment?: string }) {
  return fetchJSON<SpecResponse>(`/specs/${specId}/pr-action`, { method: "POST", body: JSON.stringify(data) });
}

// Seed
export function seedWorkspace() {
  return fetchJSON<{ id: string; name: string }>("/seed", { method: "POST" });
}
