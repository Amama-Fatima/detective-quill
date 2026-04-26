import { GitBranch } from "lucide-react";

export default function NoBranches() {
  return (
    <div className="pt-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground/50 shrink-0">
          Branch Timeline
        </span>
        <div className="flex-1 border-t border-border/50" />
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground/35 shrink-0">
          0 branches on record
        </span>
      </div>

      <div className="border border-dashed border-border/60 bg-muted/20 p-12 text-center">
        <GitBranch className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
        <p className="font-playfair-display italic text-[18px] text-primary mb-2">
          No branches yet
        </p>
        <p className="noir-text text-sm text-muted-foreground">
          Open a new branch to begin tracking your manuscript history.
        </p>
      </div>
    </div>
  );
}