export default function FeatureCard({
  tag,
  title,
  desc,
  widget,
  dark = false,
  className = "",
}: {
  tag: string;
  title: string;
  desc: string;
  widget: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl group ${className}`}
      style={{
        background: dark ? "oklch(24% 0.03 240)" : "oklch(98% 0.007 82)",
        borderColor: dark ? "oklch(32% 0.025 245)" : "oklch(82% 0.018 245)",
      }}
    >
      {/* Dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(${dark ? "oklch(96% 0.010 80)" : "oklch(24% 0.022 245)"} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-5">
        {/* Tag */}
        <div className="self-start mb-3">
          <span
            className={`text-[12px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full case-file bg-chart-5/30 font-bold  ${dark ? "text-secondary" : "text-primary"} `}
       
          >
            {tag}
          </span>
        </div>

        {/* Widget */}
        <div className="mb-4 flex-shrink-0">{widget}</div>

        {/* Text */}
        <div className="mt-auto">
          <h3
            className={`font-bold mb-1.5 tracking-tight font-playfair-display text-[1.5rem] ${dark ? "text-background" : "text-primary"}`}
         
          >
            {title}
          </h3>
          <p
            className={`text-md leading-relaxed noir-text ${dark ? "text-accent" : "text-foreground"}`}
           
          >
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}
