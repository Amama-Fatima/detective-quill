import { ScrollText } from "lucide-react";

export default function NoCommits() {
  return (
    <div className="border border-dashed border-border/60 bg-muted/20 p-14 text-center">
      <ScrollText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
      <p className="font-playfair-display italic text-[18px] text-primary mb-2">
        No entries on record
      </p>
      <p className="noir-text text-sm text-muted-foreground">
        Create a commit to begin tracking this branch&apos;s history.
      </p>

      <p className="mt-4 text-sm text-primary/80 font-mono border border-dashed border-border/40 rounded px-4 py-3 max-w-sm mx-auto">
        Note: Commit creation runs via background workers. Deployed worker
        containers may become idle after a period of inactivity. Commits may
        take a few seconds or minutes to appear after creation.{" "}
      </p>
    </div>
  );
}
