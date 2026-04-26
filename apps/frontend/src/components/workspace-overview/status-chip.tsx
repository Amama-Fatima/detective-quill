export default function StatusChip({ status }: { status: string }) {
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