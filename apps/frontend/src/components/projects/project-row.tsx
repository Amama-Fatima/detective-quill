import Link from "next/link";
import { Project } from "@detective-quill/shared-types";
import { Badge } from "../ui/badge";
import { getStatusColor, getStatusIcon } from "@/lib/utils/project-utils";
import { CaseFileIcon } from "@/components/icons/case-file-icon";
import { ClockIcon } from "../icons/clock-icon";
import { formatDate } from "date-fns";
import { ChevronRight } from "lucide-react";

interface ProjectRowProps {
  project: Project;
  index: number;
}

export default function ProjectRow({ project, index }: ProjectRowProps) {
  const formattedUpdatedAt = project.updated_at
    ? formatDate(new Date(project.updated_at), "MMM d, yyyy")
    : "Unknown date";

  const caseNumber = String(index).padStart(3, "0");

  return (
    <div className="group grid grid-cols-[80px_1fr_120px_100px_80px_160px_110px] gap-0 items-center px-4 py-3 hover:bg-muted/30 transition-colors duration-150 cursor-pointer">
      {/* Case Number */}
      <div className="flex flex-col gap-0.5">
        <span className="case-file text-[0.6rem] uppercase tracking-widest text-muted-foreground">
          Case #
        </span>
        <span className="case-file text-sm font-semibold text-foreground">
          {caseNumber}
        </span>
      </div>

      {/* Title & Summary */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div className="shrink-0 p-1.5 rounded-sm bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
          <CaseFileIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <Link
            href={`/workspace/${project.id}`}
            className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1"
          >
            {project.title}
          </Link>
          <p className="noir-text text-[0.75rem] text-muted-foreground italic line-clamp-1 mt-0.5">
            {project.description || "No case summary available..."}
          </p>
        </div>
      </div>

      {/* Status */}
      <div>
        <Badge
          className={`text-[0.65rem] case-file px-2 py-0.5 ${getStatusColor(project.status)}`}
        >
          {getStatusIcon(project.status)}
          <span className="ml-1">{project.status.toUpperCase()}</span>
        </Badge>
      </div>

      {/* Suspects — placeholder avatars if no suspect data */}
      {/* <div className="flex items-center -space-x-2">
        {(project as any).suspects?.slice(0, 3).map((s: any, i: number) => (
          <div
            key={i}
            className="h-6 w-6 rounded-full border-2 border-card bg-muted overflow-hidden"
            title={s.name}
          >
            {s.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.avatar}
                alt={s.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                <span className="text-[0.5rem] font-bold text-primary">
                  {s.name?.[0] ?? "?"}
                </span>
              </div>
            )}
          </div>
        ))}
        {(project as any).suspects?.length > 3 && (
          <div className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center">
            <span className="text-[0.5rem] text-muted-foreground font-semibold">
              +{(project as any).suspects.length - 3}
            </span>
          </div>
        )}
      </div> */}

      {/* Length (chapters) */}
      <div className="case-file text-sm text-muted-foreground">
        {(project as any).chapter_count != null
          ? `${(project as any).chapter_count} ch.`
          : "—"}
      </div>

      {/* Last Entry */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground noir-text">
        <ClockIcon size={12} />
        <span>{formattedUpdatedAt}</span>
      </div>

      {/* Open File */}
      <div className="flex items-center justify-end">
        <Link
          href={`/workspace/${project.id}`}
          className="case-file flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-semibold tracking-wide"
        >
          Open File
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
