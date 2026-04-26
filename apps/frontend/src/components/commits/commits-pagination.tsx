import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CommitsPaginationProps {
  page: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function CommitsPagination({
  page,
  totalPages,
  startIndex,
  endIndex,
  total,
  onPrev,
  onNext,
}: CommitsPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/60">
      {/* Left: case-file style count */}
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground/50">
        Entries {startIndex + 1}–{endIndex} of {total}
      </p>

      {/* Center: page stamp */}
      <span className="hidden sm:block font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground/35">
        Page {page} of {totalPages}
      </span>

      {/* Right: prev / next */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
          className="gap-1 cursor-pointer rounded-none border-border/60 case-file text-[10px] tracking-[0.08em] uppercase hover:border-primary hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
          className="gap-1 cursor-pointer rounded-none border-border/60 case-file text-[10px] tracking-[0.08em] uppercase hover:border-primary hover:text-primary transition-colors"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}