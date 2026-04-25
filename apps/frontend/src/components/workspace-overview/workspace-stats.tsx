import { Project, ProjectMember, Branch } from "@detective-quill/shared-types";
import { formatDate } from "date-fns";

interface WorkspaceStatsProps {
  project: Project;
  members: ProjectMember[];
  numBranches: number;
  activeBranch: Branch | null;
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-primary", text: "text-primary-foreground" },
    completed: { bg: "bg-chart-4", text: "text-primary-foreground" },
    archived: { bg: "bg-muted-foreground/30", text: "text-muted-foreground" },
  };
  const s = map[status] ?? map.archived;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold ${s.bg} ${s.text}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
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
    <div className="border-b border-border">
      <div className="flex flex-wrap">
        <div className="flex flex-col gap-2 px-6 py-5 border-r border-border/60 min-w-32.5">
          <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/65">
            Status
          </span>
          <StatusChip status={project.status} />
        </div>
        {stats.map(({ label, value }, i) => (
          <div
            key={label}
            className={`flex flex-col gap-2 px-6 py-5 min-w-27.5 ${i < stats.length - 1 ? "border-r border-border/60" : ""}`}
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