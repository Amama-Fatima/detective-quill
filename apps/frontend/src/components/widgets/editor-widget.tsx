import { MessageSquare } from "lucide-react";

const EditorWidget = () => (
  <div
    className="relative w-full rounded-lg overflow-hidden border border-accent bg-card"
    
  >
    {/* Toolbar */}
    <div
      className="flex items-center gap-1.5 px-3 py-2 border-b border-sidebar bg-background"
    
    >
      {["Focus", "Save", "Comments"].map((t) => (
        <div
          key={t}
          className="w-20 h-6 rounded flex items-center justify-center text-[12px] font-bold noir-text bg-accent text-primary"
      
        >
          {t}
        </div>
      ))}
      
    
    </div>
    {/* Chapter label */}
    <div className="px-3 pt-2.5 pb-1">
      <div
        className="text-[11px] tracking-[0.14em] uppercase mb-1.5 noir-text text-muted-foreground"
      >
        Chapter IV
      </div>
      <div
        className="font-bold text-[14px] mb-4 text-primary font-playfair-display"
       
      >
        The Harbour at Midnight
      </div>
      {/* Text lines */}
      {[[100], [90], [75], [100], [60]].map((ws, row) => (
        <div key={row} className="flex gap-1 mb-1">
          {ws.map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: `${w}%`,
                background:
                  row === 2 ? "oklch(88% 0.022 245)" : "oklch(85% 0.015 245)",
              }}
            />
          ))}
        </div>
      ))}
      {/* Inline comment */}
      <div
        className="mt-2 px-2 py-1 rounded border-l-2 text-[13px] noir-text text-primary bg-popover"
       
      >
        <MessageSquare className="h-3 w-3 inline-block mr-1" />
        Beta reader: &ldquo;Great tension here&rdquo;
      </div>
    </div>
    {/* Word count footer */}
    <div
      className="flex justify-between items-center px-3 py-1.5 mt-1 border-t font-playfair-display text-foreground border-accent bg-background text-[10px]"
    
    >
      <span
      >
        2,341 words
      </span>
    </div>
  </div>
);

export default EditorWidget;
