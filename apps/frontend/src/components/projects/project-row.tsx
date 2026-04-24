"use client";

import Link from "next/link";
import { Project } from "@detective-quill/shared-types";
import { formatDate } from "date-fns";

interface ProjectRowProps {
  project: Project;
  index: number;
}

function getStatusStyles(status: string) {
  switch (status) {
    case "active":
      return {
        dot: "bg-primary-foreground",
        text: "text-primary-foreground",
        bg: "bg-primary",
      };
    case "completed":
      return {
        dot: "bg-primary-foreground",
        text: "text-primary-foreground",
        bg: "bg-chart-4",
      };
    case "archived":
      return {
        dot: "bg-muted-foreground",
        text: "text-muted-foreground",
        bg: "bg-muted border border-border",
      };
    default:
      return {
        dot: "bg-border",
        text: "text-muted-foreground",
        bg: "bg-muted border border-border",
      };
  }
}

function getTabClass(status: string) {
  switch (status) {
    case "active":
      return "bg-primary";
    case "completed":
      return "bg-chart-4";
    case "archived":
      return "bg-muted-foreground/50";
    default:
      return "bg-border";
  }
}

export default function ProjectRow({ project, index }: ProjectRowProps) {
  const formattedUpdatedAt = project.updated_at
    ? formatDate(new Date(project.updated_at), "MMM d, yyyy")
    : "Unknown";

  const caseNumber = String(index).padStart(3, "0");
  const chapterCount = (project as any).chapter_count;
  const status = getStatusStyles(project.status);

  return (
    <div className="group relative grid grid-cols-[72px_1fr_152px] items-stretch border-b border-border/50 last:border-b-0 hover:bg-accent/20 transition-colors duration-100">
      {/* Coloured left tab */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-150 group-hover:w-[4px] ${getTabClass(project.status)}`}
      />

      {/* File number — demoted, supporting role */}
      <div className="flex flex-col justify-center pl-5 pr-3 py-4 border-r border-border/40">
        <span className="case-file text-[9px] tracking-[0.14em] text-muted-foreground/60 leading-none mb-1">
          FILE
        </span>
        <span className="font-mono text-[12px] font-semibold leading-none text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {caseNumber}
        </span>
      </div>

      {/* Title + description + meta */}
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
          <span className="case-file text-[10px] text-muted-foreground">
            Updated {formattedUpdatedAt}
          </span>
        </div>
      </div>

      {/* Status + action */}
      <div className="flex flex-col items-start justify-center gap-2.5 px-4 py-4">
        {/* Solid filled badge using prominent palette colors */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] ${status.bg}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${status.dot}`} />
          <span
            className={`case-file text-[10px] tracking-[0.12em] uppercase font-semibold ${status.text}`}
          >
            {project.status}
          </span>
        </div>

        <Link
          href={`/workspace/${project.id}`}
          className="
            case-file text-[10px] tracking-[0.08em]
            border border-border/70 px-3 py-[5px]
            text-muted-foreground
            hover:border-primary hover:text-primary hover:bg-primary/5
            transition-colors inline-flex items-center gap-1.5
          "
        >
          Open File
          <span className="text-[12px] leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}
