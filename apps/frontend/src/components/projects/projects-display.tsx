import ProjectRow from "./project-row";
import { useSearchParams } from "next/navigation";
import { tab_message } from "@/constants/project-constants";
import NoProjectCard from "./no-project-card";
import { Project } from "@detective-quill/shared-types";
import { CornerOrnamentIcon } from "@/components/icons/corner-ornament-icon";

interface ProjectsDisplayProps {
  projects: Project[];
}

export default function ProjectsDisplay({ projects }: ProjectsDisplayProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const tabMeta = tab_message.find((m) => m.tab === tab);
  const title = tabMeta?.title ?? "Projects";
  const description =
    tabMeta?.description ??
    "The detective's desk is empty. Time to start a new investigation!";

  if (projects.length === 0) {
    return <NoProjectCard title={title} description={description} />;
  }

  return (
    <div className="relative w-full border border-border rounded-sm overflow-hidden bg-card shadow-md">
      {/* Corner ornaments — sit on top of the border on all four corners */}
      <CornerOrnamentIcon className="pointer-events-none absolute left-1 top-1 z-10 h-10 w-10 text-border/70" />
      <CornerOrnamentIcon className="pointer-events-none absolute right-1 top-1 z-10 h-10 w-10 rotate-90 text-border/70" />
      <CornerOrnamentIcon className="pointer-events-none absolute left-1 bottom-1 z-10 h-10 w-10 -rotate-90 text-border/70" />
      <CornerOrnamentIcon className="pointer-events-none absolute right-1 bottom-1 z-10 h-10 w-10 rotate-180 text-border/70" />

      {/* Table Header */}
      <div className="grid grid-cols-[80px_1fr_120px_100px_80px_160px_110px] gap-0 border-b border-border bg-muted/40 px-4 py-2">
        <span className="case-file text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
          Case #
        </span>
        <span className="case-file text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
          Title &amp; Summary
        </span>
        <span className="case-file text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
          Status
        </span>
        <span className="case-file text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
          Length
        </span>
        <span className="case-file text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
          Last Entry
        </span>
        <span className="sr-only">Actions</span>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-border/60">
        {projects.map((project, index) => (
          <ProjectRow key={project.id} project={project} index={index + 1} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2">
        <span className="case-file text-[0.65rem] text-muted-foreground uppercase tracking-widest">
          Showing {projects.length} of {projects.length}
        </span>
        <span className="case-file text-[0.65rem] text-muted-foreground uppercase tracking-widest italic">
          Detective&apos;s Quill
        </span>
      </div>
    </div>
  );
}
