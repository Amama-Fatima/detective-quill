import { FileText } from "lucide-react";

export default function NoBlueprints() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 border border-border/60 border-dashed bg-muted/20">
        <div className="p-6 border border-border/50 bg-card">
          <FileText className="h-8 w-8 text-primary/40" />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="font-playfair-display text-[18px] font-bold text-primary">
            No Blueprints Yet
          </h3>
          <p className="noir-text text-[14px] text-muted-foreground max-w-sm">
            Create a blueprint to start organising your story structures,
            character sheets, and scene templates.
          </p>
        </div>
      </div>
    )
}