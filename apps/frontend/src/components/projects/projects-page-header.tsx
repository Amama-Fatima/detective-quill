import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  totalCount: number;
  onNewCase: () => void;
}

export default function ProjectsPageHeader({ totalCount, onNewCase }: PageHeaderProps) {
  return (
    <header className="relative border-b border-border bg-card/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-7">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="case-file text-xs text-muted-foreground mb-1 tracking-[0.14em]">
              Detective&apos;s Quill — Case Registry
            </p>
            <h1 className="font-playfair-display text-[clamp(26px,4vw,40px)] font-bold leading-none tracking-[-0.02em] text-primary">
              My Investigations
            </h1>
            <p className="noir-text text-sm text-muted-foreground mt-1.5">
              {totalCount > 0
                ? `${totalCount} case ${totalCount === 1 ? "file" : "files"} on record`
                : "No cases on record yet"}
            </p>
          </div>
          <Button
            onClick={onNewCase}
            size="lg"
            className="bg-primary text-primary-foreground font-playfair-display text-[15px] tracking-[0.02em] px-7 py-5 shadow-[0_4px_20px_oklch(24%_0.022_245/0.22)] hover:-translate-y-0.5 hover:bg-secondary-foreground transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Open New Case
          </Button>
        </div>
      </div>
    </header>
  );
}