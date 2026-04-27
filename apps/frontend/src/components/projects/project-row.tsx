"use client";

import Link from "next/link";
import { Project } from "@detective-quill/shared-types";
import { formatDate } from "date-fns";
import { ClockIcon } from "../icons/clock-icon";
import StatusChip from "../workspace-overview/status-chip";

interface ProjectRowProps {
  project: Project;
  index: number;
}

export default function ProjectRow({ project, index }: ProjectRowProps) {
  const formattedUpdatedAt = project.updated_at
    ? formatDate(new Date(project.updated_at), "MMM d, yyyy")
    : "Unknown";

  const caseNumber = String(index).padStart(2, "0");
  const chapterCount = (project as any).chapter_count;
  return (
    <div className="group relative grid grid-cols-[72px_1fr_152px] items-stretch border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors duration-100 hover:border-l hover:border-l-primary">
      <div className="flex flex-col justify-center pl-5 pr-3 py-4 border-r border-border/40">
        <span className="case-file text-[9px] tracking-[0.14em] text-foreground/80 leading-none mb-1">
          Project
        </span>
        <span className="font-mono text-[12px] font-semibold leading-none text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {caseNumber}
        </span>
      </div>

      <div className="min-w-0 py-4 px-5 border-r border-border/40">
        <Link
          href={`/workspace/${project.id}`}
          className="font-playfair-display text-[20px] font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1 block"
        >
          {project.title}
        </Link>
        <p className="noir-text text-[13px] text-muted-foreground italic mt-0.5 line-clamp-1">
          {project.description || "No case summary available."}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {chapterCount != null && (
            <>
              <span className="case-file text-[10px] text-muted-foreground">
                {chapterCount} ch.
              </span>
              <span className="case-file text-[10px] text-border">·</span>
            </>
          )}
          <ClockIcon />
          <span className="case-file text-[10px] text-muted-foreground">
            Updated {formattedUpdatedAt}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start justify-center gap-2.5 px-4 py-4">
        <StatusChip status={project.status} />

        <Link
          href={`/workspace/${project.id}`}
          className="
            case-file text-[13px] tracking-[0.08em]
            border border-border px-3 py-1.25
            text-foreground
            hover:border-primary hover:text-primary hover:bg-primary/5
            transition-colors inline-flex items-center gap-1.5
          "
        >
          Open
          <span className="text-[12px] leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}
