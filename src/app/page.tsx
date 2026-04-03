"use client";

import { useEffect } from "react";
import { useSpecs, useSeedWorkspace, WORKSPACE_ID_KEY } from "@/lib/queries";
import SpecTree from "@/components/SpecTree";
import StageTabs from "@/components/StageTabs";
import StageEditor from "@/components/StageEditor";
import styles from "./page.module.css";

export default function Home() {
  const seed = useSeedWorkspace();
  const { data: specs, isLoading } = useSpecs();

  // Auto-seed workspace on first load
  useEffect(() => {
    const wid = localStorage.getItem(WORKSPACE_ID_KEY);
    if (!wid) {
      seed.mutate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading && !specs) {
    return (
      <div className={styles.loading}>
        <span>Loading SpecFlow...</span>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <SpecTree />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            <span className={styles.logoText}>SpecFlow</span>
          </div>
          <span className={styles.tagline}>Spec-driven development platform</span>
        </header>
        <StageTabs />
        <StageEditor />
      </main>
    </div>
  );
}
