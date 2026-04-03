import { atom } from "nanostores";

export const $selectedSpecId = atom<string | null>(null);
export const $activeStageIndex = atom<number>(0);
export const $sidebarOpen = atom<boolean>(true);
