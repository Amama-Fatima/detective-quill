import { WorkspaceLayout } from "@/components/editor-workspace/workspace-layout";

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
    <WorkspaceLayout projectId={projectId} nodeId={nodeId}>
      {children}
    </WorkspaceLayout>
  );
}
