import type { Branch } from "@detective-quill/shared-types";

interface VersionControlStatsBarProps {
  branches: Branch[];
}

export default function VersionControlStatsBar({
  branches,
}: VersionControlStatsBarProps) {
  const activeBranch = branches.find((b) => b.is_active);
  const defaultBranch = branches.find((b) => b.is_default);

  const stats = [
    { label: "Total Branches", value: String(branches.length) },
    { label: "Active Branch", value: activeBranch?.name ?? "None" },
    { label: "Default Branch", value: defaultBranch?.name ?? "None" },
  ];

  return (
    <div className="border-b border-border">
      <div className="flex flex-wrap">
        {stats.map(({ label, value }, i) => (
          <div
            key={label}
            className={`flex flex-col gap-2 px-6 py-5 min-w-[130px] ${i < stats.length - 1 ? "border-r border-border/60" : ""}`}
          >
            <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/45">
              {label}
            </span>
            <span className="font-playfair-display text-[15px] font-bold text-primary leading-none truncate max-w-[160px]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}