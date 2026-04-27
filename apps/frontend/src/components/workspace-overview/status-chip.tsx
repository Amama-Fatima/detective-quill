import { getStatusStyles } from "../../lib/utils/project-utils";

export default function StatusChip({ status }: { status: string }) {
  const s = getStatusStyles(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}
