"use client";

import ProjectRow from "./project-row";
import { useSearchParams } from "next/navigation";
import { tab_message } from "@/constants/project-constants";
import NoProjectCard from "./no-project-card";
import { Project } from "@detective-quill/shared-types";

interface ProjectsDisplayProps {
  projects: Project[];
}

export default function ProjectsDisplay({ projects }: ProjectsDisplayProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const tabMeta = tab_message.find((m) => m.tab === tab);

  const title = tabMeta?.title ?? "Investigations";
  const description =
    tabMeta?.description ??
    "The detective's desk is empty. Time to start a new investigation!";

  if (projects.length === 0) {
    return <NoProjectCard title={title} description={description} />;
  }

  return (
    <div className="relative w-full">
      {/* ── Cabinet label ── */}
      <div className="mb-3 flex items-baseline justify-between px-0.5">
        <h2 className="mystery-title text-lg text-foreground">{title}</h2>
        <span className="case-file text-xs text-muted-foreground">
          {projects.length} {projects.length === 1 ? "file" : "files"} on record
        </span>
      </div>

      {/* ── Cabinet frame ── */}
      <div className="relative border border-border bg-card overflow-hidden">
        {/* Corner ornaments — ✦ using foreground/border tokens */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-2 top-2 font-mono text-xs leading-none text-border z-10 select-none"
        >
          ✦
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 font-mono text-xs leading-none text-border z-10 select-none"
        >
          ✦
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute left-2 bottom-9 font-mono text-xs leading-none text-border z-10 select-none"
        >
          ✦
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-9 font-mono text-xs leading-none text-border z-10 select-none"
        >
          ✦
        </span>

        {/* ── Column header ── */}
        <div className="grid grid-cols-[76px_1fr_140px] border-b border-border bg-muted">
          <div className="pl-5 py-2.5 border-r border-border/40">
            <span className="case-file text-xs text-muted-foreground">
              File #
            </span>
          </div>
          <div className="pl-5 py-2.5 border-r border-border/40">
            <span className="case-file text-xs text-muted-foreground">
              Title &amp; Summary
            </span>
          </div>
          <div className="px-5 py-2.5">
            <span className="case-file text-xs text-muted-foreground">
              Status
            </span>
          </div>
        </div>

        <div>
          {projects.map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
