"use client";

import Link from "next/link";
import { Project } from "@detective-quill/shared-types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

interface ProjectRowProps {
  project: Project;
  index: number;
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default"; // solid primary — navy stamp
    case "completed":
      return "secondary"; // hollow border
    case "archived":
      return "outline"; // faded dashed
    default:
      return "outline";
  }
}

// Left tab accent colour — uses CSS variables where possible
function getTabClass(status: string) {
  switch (status) {
    case "active":
      return "bg-primary";
    case "completed":
      return "bg-chart-4"; // oklch(62% 0.08 155) — muted green
    case "archived":
      return "bg-muted-foreground/40";
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

  return (
    <div className="group relative flex items-stretch border-b border-border/50 last:border-b-0 hover:bg-accent/30 transition-colors duration-100">
      {/* ── Coloured left tab ── */}
      <div
        className={`w-1.5 shrink-0 transition-all duration-150 group-hover:w-2 ${getTabClass(project.status)}`}
      />

      {/* ── File number ── */}
      <div className="flex flex-col justify-center gap-0.5 px-4 py-4 min-w-[76px] border-r border-border/40">
        <span className="case-file text-[11px] text-muted-foreground">
          File
        </span>
        <span className="font-mono text-xl font-bold leading-none text-foreground">
          {caseNumber}
        </span>
      </div>

      {/* ── Title + description + meta ── */}
      <div className="flex-1 min-w-0 py-4 px-5 border-r border-border/40">
        <Link
          href={`/workspace/${project.id}`}
          className="mystery-title text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1"
        >
          {project.title}
        </Link>
        <p className="noir-text text-sm text-muted-foreground italic mt-1 line-clamp-1">
          {project.description || "No case summary available."}
        </p>
        <div className="mt-2 flex items-center gap-3">
          {chapterCount != null && (
            <span className="case-file text-xs text-muted-foreground">
              {chapterCount} ch.
            </span>
          )}
          <span className="case-file text-xs text-muted-foreground">
            · Updated {formattedUpdatedAt}
          </span>
        </div>
      </div>

      {/* ── Status + action ── */}
      <div className="flex flex-col items-end justify-center gap-3 px-5 py-4 shrink-0 min-w-[140px]">
        <Badge variant={getStatusVariant(project.status)}>
          {project.status}
        </Badge>

        <Link
          href={`/workspace/${project.id}`}
          className="
            case-file text-xs
            border border-border px-3 py-1
            text-foreground/70
            hover:border-primary hover:text-primary
            transition-colors inline-flex items-center gap-2
          "
        >
          Open File
          <span className="text-sm leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}
