import { Suspense } from "react";
import { Workspace } from "@/components/workspace/workspace";
import { FileText } from "lucide-react";

function WorkspaceLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-muted p-6">
          <FileText className="h-12 w-12 animate-pulse text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Loading Workspace...</h2>
          <p className="text-sm text-muted-foreground">
            Setting up your markdown editor
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceWrapper() {
  return (
    <main className="h-screen bg-background">
      <Suspense fallback={<WorkspaceLoader />}>
        <Workspace projectTitle="add" />
      </Suspense>
    </main>
  );
}
