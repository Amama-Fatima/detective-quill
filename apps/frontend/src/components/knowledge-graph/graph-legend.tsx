import { LABEL_COLORS } from "@/lib/utils/graph-utils";

export function GraphLegend() {
  return (
    <div className="absolute bottom-20 left-4 rounded-md px-3 py-2 flex flex-col gap-1.5 bg-card/90 border border-border backdrop-blur-sm shadow-sm">
      <p className="text-[10px] tracking-[0.2em] uppercase mb-1 text-muted-foreground font-serif">
        Entity types
      </p>
      {Object.entries(LABEL_COLORS).map(([label, color]) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: color }}
          />
          <span className="text-xs text-foreground font-serif">{label}</span>
        </div>
      ))}
    </div>
  );
}
