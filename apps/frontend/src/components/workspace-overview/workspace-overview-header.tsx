import { Project } from "@detective-quill/shared-types";
import WritingLottie from "../blueprint/writing-lottie";

interface WorkspaceHeaderProps {
  project: Project;
}

export default function WorkspaceOverviewHeader({ project }: WorkspaceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-muted-foreground/65 mb-3">
          Case Workspace — Overview
        </p>
        <h1 className="font-playfair-display italic text-[clamp(32px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.025em] text-primary mb-4">
          {project.title}
        </h1>
        <p className="noir-text text-[15px] leading-[1.8] text-foreground/65 max-w-xl">
          {project.description ??
            "This section provides an overview and notes for the ongoing project."}
        </p>
      </div>
      <div className="shrink-0 flex flex-col items-center gap-4 self-center sm:self-end">
        <WritingLottie />
      </div>
    </div>
  );
}