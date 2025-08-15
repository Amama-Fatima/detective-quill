import { WorkspaceLayout } from "@/components/editor-workspace/workspace-layout";
import { Suspense } from "react";

export const metadata = {
  title: "Workspace",
  description: "Markdown editor workspace with file management",
};

interface WorkspaceLayoutPageProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string; nodeId: string | undefined }>; // params is now a Promise
}

export default async function Layout({
  children,
  params,
}: WorkspaceLayoutPageProps) {
  const { projectId, nodeId } = await params;

  return (
    // <Suspense fallback={<WorkspaceLayoutSkeleton />}>
    <WorkspaceLayout projectId={projectId} nodeId={nodeId}>
      {children}
    </WorkspaceLayout>
    // {/* </Suspense> */}
  );
}

function WorkspaceLayoutSkeleton() {
  return (
    <div className="flex h-screen w-full bg-background">
      <div className="w-80 border-r bg-card/50 animate-pulse">
        <div className="p-4 border-b">
          <div className="h-4 bg-muted rounded w-32 mb-2" />
          <div className="h-3 bg-muted rounded w-24" />
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded" />
          ))}
        </div>
      </div>
      <div className="flex-1 animate-pulse">
        <div className="h-12 border-b bg-muted/20" />
        <div className="flex-1 bg-muted/10" />
      </div>
    </div>
  );
}
