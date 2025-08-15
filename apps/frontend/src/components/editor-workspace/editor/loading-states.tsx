import { FileText, Loader2 } from "lucide-react";

export const FileLoadingState = () => (
  <div className="flex h-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading file...</p>
    </div>
  </div>
);

export const FileNotFoundState = () => (
  <div className="flex h-full items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">File not found</h2>
        <p className="text-sm text-muted-foreground">
          The file you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    </div>
  </div>
);
