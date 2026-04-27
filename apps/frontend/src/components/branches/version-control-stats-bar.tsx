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
    <div className="py-6">
      <div className="inline-flex rounded-xl border border-border overflow-hidden">
        {stats.map(({ label, value }, i) => (
          <div
            key={label}
            className={`flex flex-col gap-2 px-6 py-4 bg-accent/20 ${
              i < stats.length - 1 ? "border-r border-border" : ""
            }`}
          >
            <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/45">
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