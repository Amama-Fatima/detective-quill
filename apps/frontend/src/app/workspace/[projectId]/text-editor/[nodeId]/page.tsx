import { Suspense } from "react";
import { TextEditorContainer } from "@/components/editor-workspace/editor/text-editor-container";

interface NodePageProps {
  params: Promise<{
    projectId: string;
    nodeId: string;
  }>;
}

export default async function NodePage({ params }: NodePageProps) {
  const { projectId, nodeId } = await params;

  return (
    <Suspense fallback={<EditorSkeleton />}>
      <TextEditorContainer projectId={projectId} nodeId={nodeId} />
    </Suspense>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3 bg-card/50">
        <div className="h-5 bg-muted rounded w-48 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="border-b px-4 py-2 bg-card/30">
        <div className="flex gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-8 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex-1 bg-muted/5 animate-pulse" />
    </div>
  );
}
