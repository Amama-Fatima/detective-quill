const COLORS = [
  "oklch(90% 0.012 80)",
  "oklch(80% 0.030 245)",
  "oklch(60% 0.040 245)",
  "oklch(38% 0.035 245)",
  "oklch(24% 0.022 245)",
];

function seededRandom(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEEKS = 5;
const DAYS = 7;

const rng = seededRandom(0xdeadbeef);
const HEATMAP_DATA: number[][] = Array.from({ length: WEEKS }, (_, w) =>
  Array.from({ length: DAYS }, (_, d) => {
    // June has 30 days, so leave the final 5 cells empty-looking.
    if (w === WEEKS - 1 && d > 1) return 0;
    const val = rng();
    if (val > 0.88) return 4;
    if (val > 0.7) return 3;
    if (val > 0.4) return 2;
    if (val > 0.2) return 1;
    return 0;
  }),
);

export const HeatmapWidget = () => (
  <div>
    <div className="flex gap-14">
      <div className="">
        <div className="flex mb-1">
          <span className="text-lg noir-text text-foreground">June</span>
        </div>
        <div className="flex gap-[3px]">
          {HEATMAP_DATA.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((val, di) => (
                <div
                  key={di}
                  className="w-4 h-4 md:w-2.5 md:h-3 lg:w-4 lg:h-4 rounded-[2px]"
                  style={{ background: COLORS[val] }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="">
        <div className="flex mb-1">
          <span className="text-lg noir-text text-foreground">July</span>
        </div>
        <div className="flex gap-[3px]">
          {HEATMAP_DATA.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((val, di) => (
                <div
                  key={di}
                  className="w-4 h-4 md:w-2.5 md:h-3 lg:w-4 lg:h-4 rounded-[2px]"
                  style={{ background: COLORS[val] }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-1 mt-2 mt-5">
      <span className="text-sm noir-text text-muted-foreground">Less</span>

      {COLORS.map((c, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-[2px]"
          style={{ background: c }}
        />
      ))}
      <span className="text-sm noir-text text-muted-foreground">More</span>
    </div>
  </div>
);

export default HeatmapWidget;
