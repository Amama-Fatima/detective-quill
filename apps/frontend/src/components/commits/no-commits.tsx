import { ScrollText } from "lucide-react";

export default function NoCommits() {
  return (
    <div className="border border-dashed border-border/60 bg-muted/20 p-14 text-center">
      <ScrollText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
      <p className="font-playfair-display italic text-[18px] text-primary mb-2">
        No entries on record
      </p>
      <p className="noir-text text-sm text-muted-foreground">
        Save a commit from the Case Files view to begin tracking this
        branch&apos;s history.
      </p>
    </div>
  );
}