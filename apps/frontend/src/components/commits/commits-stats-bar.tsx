import type { Branch } from "@detective-quill/shared-types";

interface CommitsStatsBarProps {
  branch: Branch;
  commitCount: number;
}

export default function CommitsStatsBar({
  branch,
  commitCount,
}: CommitsStatsBarProps) {
  const stats = [
    { label: "Total Commits", value: String(commitCount) },
    { label: "Branch Status", value: branch.is_active ? "Active" : "Inactive" },
    { label: "Type", value: branch.is_default ? "Default" : "Feature" },
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
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-foreground">
              {label}
            </span>
            <span className="font-playfair-display text-[17px] font-bold text-primary leading-none">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
