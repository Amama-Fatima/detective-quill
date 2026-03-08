const GraphWidget = () => {
  const nodes = [
    { x: 28, y: 50, label: "Inspector\nMarlowe", main: true },
    { x: 70, y: 25, label: "Lady\nVane", main: false },
    { x: 72, y: 72, label: "Col.\nAshford", main: false },
    { x: 48, y: 78, label: "The\nVault", main: false, loc: true },
    { x: 15, y: 22, label: "1921\nGazette", main: false, loc: true },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [2, 3],
    [0, 4],
  ];
  return (
    <div
      className="relative h-full w-full min-h-50 overflow-hidden rounded-lg border border-border"
      style={{ background: "oklch(14% 0.010 245)" }}
    >
      <svg className="absolute inset-0 h-full w-full text-primary opacity-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <line
              x1={`${i * 14.28}%`}
              y1="0"
              x2={`${i * 14.28}%`}
              y2="100%"
              stroke="white"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1={`${i * 14.28}%`}
              x2="100%"
              y2={`${i * 14.28}%`}
              stroke="white"
              strokeWidth="0.5"
            />
          </g>
        ))}
      </svg>
      <svg className="absolute inset-0 h-full w-full">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={`${nodes[a].x}%`}
            y1={`${nodes[a].y}%`}
            x2={`${nodes[b].x}%`}
            y2={`${nodes[b].y}%`}
            stroke="white"
            strokeWidth="0.8"
            strokeOpacity="0.5"
            strokeDasharray="3 2"
            className="text-primary"
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle
              cx={`${n.x}%`}
              cy={`${n.y}%`}
              r={n.main ? "24" : "20"}
              strokeWidth={n.main ? "1.5" : "1"}
              className={
                n.loc
                  ? "fill-popover stroke-primary"
                  : n.main
                    ? "fill-primary stroke-secondary"
                    : "fill-muted stroke-primary"
              }
            />
            <text
              x={`${n.x}%`}
              y={`${n.y}%`}
              textAnchor="middle"
              fontSize={n.main ? "10" : "8"}
              dominantBaseline="middle"
              className={`noir-text ${n.main ? "fill-secondary" : "fill-foreground"}`}
            >
              {n.label.split("\n").map((t, li, lines) => (
                <tspan
                  key={li}
                  x={`${n.x}%`}
                  dy={
                    li === 0 ? (lines.length > 1 ? "-0.45em" : "0") : "1.05em"
                  }
                >
                  {t}
                </tspan>
              ))}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 left-3 font-serif text-[8px] uppercase tracking-widest text-primary">
        Case #2847
      </div>
    </div>
  );
};

export default GraphWidget;
