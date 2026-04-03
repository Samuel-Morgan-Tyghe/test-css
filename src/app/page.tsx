"use client";

import { useEffect } from "react";
import { useSpecs, useSeedWorkspace, WORKSPACE_ID_KEY } from "@/lib/queries";
import SpecTree from "@/components/SpecTree";
import StageTabs from "@/components/StageTabs";
import StageEditor from "@/components/StageEditor";

export default function Home() {
  const seed = useSeedWorkspace();
  const { data: specs, isLoading } = useSpecs();

  useEffect(() => {
    const wid = localStorage.getItem(WORKSPACE_ID_KEY);
    if (!wid) {
      seed.mutate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading && !specs) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-specflow-text-muted text-[15px]">
        Loading SpecFlow...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SpecTree />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-5 py-3 bg-specflow-surface border-b border-specflow-border">
          <div className="flex items-center gap-2">
            <span className="text-specflow-cyan text-xl">◈</span>
            <span className="text-base font-bold text-white tracking-tight">SpecFlow</span>
          </div>
          <span className="text-xs text-specflow-text-muted">Spec-driven development platform</span>
        </header>
        <StageTabs />
        <StageEditor />
      </main>
    </div>
  );
}
