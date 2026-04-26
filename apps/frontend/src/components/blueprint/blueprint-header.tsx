import CreateBlueprintBtns from "./btns/create-blueprint-btns";
import WritingLottie from "./writing-lottie";

interface BlueprintHeroProps {
  projectId: string;
}

export default function BlueprintHeader({ projectId }: BlueprintHeroProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-muted-foreground/50 mb-3">
          Case Workspace — Blueprints
        </p>
        <h1 className="font-playfair-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.025em] text-primary mb-4 italic">
          Blueprints
        </h1>
        <p className="noir-text text-[15px] leading-[1.8] text-foreground/65 max-w-xl mb-6">
          Manage and organise your reusable story structures, character sheets,
          and scene templates.
        </p>
        <CreateBlueprintBtns projectId={projectId} />
      </div>
      <div className="shrink-0 flex flex-col items-center gap-4 self-center sm:self-end">
        <WritingLottie />
      </div>
    </div>
  );
}