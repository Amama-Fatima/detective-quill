const GamificationWidget = () => {
  const badges = [
    { label: "Night Owl", icon: "🦉", earned: true },
    { label: "Plot Twist", icon: "🔀", earned: true },
    { label: "Word Smith", icon: "⚒️", earned: true },
    { label: "Sherlock 2.0", icon: "🕵️", earned: false },
    { label: "Sealed Case", icon: "🔏", earned: true },
    { label: "The Alibi", icon: "📋", earned: false },
  ];
  return (
    <div className="space-y-3">
      {/* XP bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[16px] font-semibold text-primary noir-text">
            Level 7: Senior Inspector
          </span>
          <span className="text-[12px] noir-text text-muted-foreground">
            2,340 / 3,000 XP
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden bg-accent">
          <div className="h-full rounded-full w-[70%] bg-foreground" />
        </div>
      </div>
      {/* Streak */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-popover">
        <span className="text-xl">🔥</span>
        <div>
          <div className="text-[15px] font-bold font-playfair-display text-primary">
            14-day streak
          </div>
          <div className="text-[12px] noir-text text-foreground">
            Write today to keep it going
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="grid grid-cols-3 gap-2">
        {badges.map((b) => (
          <div
            key={b.label}
            className={`flex flex-col items-center gap-0.5 rounded-lg border p-1.5 text-center transition-colors ${
              b.earned
                ? "border-primary/60 bg-primary text-primary-foreground"
                : "border-border bg-muted text-muted-foreground opacity-55"
            }`}
          >
            <span className={`text-lg ${b.earned ? "" : "grayscale"}`}>
              {b.icon}
            </span>
            <span className="text-[14px] leading-tight font-serif">
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamificationWidget;
