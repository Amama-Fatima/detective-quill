"use client";

import ProjectRow from "./project-row";
import { useSearchParams } from "next/navigation";
import { tab_message } from "@/constants/project-constants";
import NoProjectCard from "./no-project-card";
import { Project } from "@detective-quill/shared-types";

interface ProjectsListTableProps {
  projects: Project[];
}

export default function ProjectsListTable({ projects }: ProjectsListTableProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const tabMeta = tab_message.find((m) => m.tab === tab);

  const title = tabMeta?.title ?? "All Projects";
  const description =
    tabMeta?.description ??
    "The detective's desk is empty. Time to start a new investigation!";

  if (projects.length === 0) {
    return <NoProjectCard title={title} description={description} />;
  }

  return (
    <div className="relative w-full">
      <div className="mb-3 flex items-baseline justify-between px-0.5">
        <h2 className="font-playfair-display text-lg font-bold text-foreground tracking-[-0.01em]">
          {title}
        </h2>
        <span className="case-file text-[11px] text-muted-foreground">
          {projects.length} {projects.length === 1 ? "file" : "files"} on record
        </span>
      </div>

      <div className="relative border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[72px_1fr_152px] border-b-2 border-border bg-muted/80">
          <div className="pl-5 py-3 border-r border-border/50">
            <span className="case-file text-[10px] tracking-[0.14em] text-muted-foreground">
              Project #
            </span>
          </div>
          <div className="pl-5 py-3 border-r border-border/50">
            <span className="case-file text-[10px] tracking-[0.14em] text-muted-foreground">
              Title &amp; Summary
            </span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="case-file text-[10px] tracking-[0.14em] text-muted-foreground">
              Status
            </span>
            <span className="case-file text-[10px] tracking-[0.14em] text-muted-foreground pr-1">
              Action
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
