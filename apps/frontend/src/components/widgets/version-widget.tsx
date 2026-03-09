const VersionWidget = () => {
  const commits = [
    {
      msg: "Draft: The Harbour scene",
      time: "2h ago",
      canRevert: true,
      hasSnapshot: true,
    },
    {
      msg: "Revised: Vane's alibi chapter",
      time: "Yesterday",
      canRevert: true,
      hasSnapshot: true,
    },
    {
      msg: "Added: Ashford backstory",
      time: "3 days ago",
      canRevert: false,
      reverted: true,
      hasSnapshot: true,
    },
  ];

  const branches = [
    { name: "main", tag: "Active" },
    { name: "harbour-scene", tag: "Default" },
    { name: "alibi-timeline", tag: "Switch" },
  ];

  return (
    <div className="flex gap-4 w-full mt-5">
      {/* Timeline */}
      <div className="flex-1 space-y-2">
        {commits.map((c, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="flex flex-col items-center mt-1">
              <div
                className={`h-2 w-2 rounded-full border-2 ${i === 0 ? "bg-popover" : "bg-transparent"}`}
              />
              {i < commits.length - 1 && (
                <div className="mt-1 h-6 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold font-serif text-background">
                {c.msg}
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[11px] font-serif text-accent">
                  {c.time}
                </span>
                {c.hasSnapshot && (
                  <button
                    type="button"
                    className="rounded border border-border bg-secondary px-1.5 py-px text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground transition-colors hover:bg-accent"
                  >
                    Snapshot
                  </button>
                )}
                {c.reverted ? (
                  <span className="rounded border border-border bg-muted px-1.5 py-px text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Current
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!c.canRevert}
                    className="rounded border border-border bg-popover px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Revert
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Branches + revert controls */}
      <div className="w-44 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-2 py-1 text-xs font-serif uppercase tracking-widest text-muted-foreground">
          Branches
        </div>
        <div className="space-y-1.5 p-2">
          {branches.map((branch) => (
            <div
              key={branch.name}
              className="rounded-md border border-border bg-popover p-1.5"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate font-mono text-[10px] text-foreground">
                  {branch.name}
                </span>
                <span
                  className={`rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide ${
                    branch.tag === "Active"
                      ? "bg-green-100 text-primary"
                      : branch.tag === "Default"
                        ? "bg-primary text-background"
                        : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {branch.tag}
                </span>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="w-full rounded-md border border-border bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground"
          >
            Create New Branch
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionWidget;
