import { Project, ProjectMember, Branch } from "@detective-quill/shared-types";
import { formatDate } from "date-fns";
import StatusChip from "./status-chip";

interface WorkspaceStatsProps {
  project: Project;
  members: ProjectMember[];
  numBranches: number;
  activeBranch: Branch | null;
}

export default function WorkspaceStats({
  project,
  members,
  numBranches,
  activeBranch,
}: WorkspaceStatsProps) {
  const formattedUpdatedAt = project.updated_at
    ? formatDate(new Date(project.updated_at), "MMM d, yyyy")
    : "N/A";
  const formattedCreatedAt = project.created_at
    ? formatDate(new Date(project.created_at), "MMM d, yyyy")
    : "N/A";

  const stats = [
    { label: "Members", value: String(members.length) },
    { label: "Branches", value: String(numBranches) },
    { label: "Active Branch", value: activeBranch?.name ?? "None" },
    { label: "Last Updated", value: formattedUpdatedAt },
    { label: "Opened", value: formattedCreatedAt },
  ];

  return (
    <div className="py-6">
      <div className="inline-flex rounded-xl border border-border overflow-hidden">
        <div className="flex flex-col gap-2 px-6 py-4 bg-accent/20 border-r border-border">
          <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/65">
            Status
          </span>
          <StatusChip status={project.status} />
        </div>
        {stats.map(({ label, value }, i) => (
          <div
            key={label}
            className={`flex flex-col gap-2 px-6 py-4 bg-accent/20 ${
              i < stats.length - 1 ? "border-r border-border" : ""
            }`}
          >
            <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/65">
              {label}
            </span>
            <span className="font-playfair-display text-[15px] font-bold text-primary leading-none">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}