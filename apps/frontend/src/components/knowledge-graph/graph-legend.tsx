import { NODE_TYPE_CONFIGS, EntityType } from "@/lib/utils/node-type-config";

const LEGEND_TYPES: EntityType[] = [
  "PERSON",
  "ORG",
  "GPE",
  "LOC",
  "FAC",
  "PRODUCT",
  "EVENT",
  "Scene",
];

export function GraphLegend() {
  return (
    <div className="absolute bottom-20 left-4 rounded-md px-3 py-2.5 flex flex-col gap-1.5 bg-card/90 border border-border backdrop-blur-sm shadow-sm min-w-[140px]">
      <p className="text-[9px] tracking-[0.2em] uppercase mb-0.5 text-muted-foreground font-serif">
        Entity types
      </p>
      {LEGEND_TYPES.map((type) => {
        const cfg = NODE_TYPE_CONFIGS[type];
        return (
          <div key={type} className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0 text-[8px] font-bold"
              style={{
                background: cfg.color,
                border: `1.5px solid ${cfg.borderColor}`,
                color: "#fff",
              }}
            >
              {cfg.icon ? (
                <img
                  src={cfg.icon}
                  alt=""
                  width={9}
                  height={9}
                  style={{ filter: "invert(1)", opacity: 0.9 }}
                />
              ) : null}
            </span>
            <span className="text-[11px] text-foreground font-serif leading-none">
              {cfg.displayName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
