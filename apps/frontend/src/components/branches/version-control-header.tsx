"use client";

import { Plus } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface VersionControlHeaderProps {
  projectId: string;
  branchCount: number;
  onNewBranch: () => void;
}

export default function VersionControlHeader({
  projectId,
  branchCount,
  onNewBranch,
}: VersionControlHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-muted-foreground/50 mb-3">
          Case Workspace — Manuscript History
        </p>
        <h1 className="font-playfair-display italic text-[clamp(32px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.025em] text-primary mb-4">
          Branch Registry
        </h1>
        <p className="noir-text text-[15px] leading-[1.8] text-foreground/65 max-w-xl mb-6">
          Each branch is a diverging thread of the investigation. Switch between
          timelines, preserve alternate narratives, and keep your manuscript
          history intact.
        </p>
        <button
          onClick={onNewBranch}
          className="inline-flex rounded-md items-center gap-2 bg-primary text-primary-foreground font-playfair-display text-[15px] tracking-[0.02em] px-7 py-2.5 shadow-[0_4px_20px_oklch(24%_0.022_245/0.22)] hover:-translate-y-0.5 hover:bg-secondary-foreground transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Open New Branch
        </button>
      </div>

      <div className="shrink-0 flex flex-col items-center gap-4 self-center sm:self-end">
        <DotLottieReact
          src="/branches.lottie"
          loop
          autoplay
          style={{ width: 140, height: 140 }}
        />
      </div>
    </div>
  );
}