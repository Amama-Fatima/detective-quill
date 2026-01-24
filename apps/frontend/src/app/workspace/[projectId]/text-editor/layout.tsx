import WorkspaceLayout from "@/components/editor-workspace/workspace-layout/workspace-layout";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { projectId: string };
}): Promise<Metadata> {
  const { projectId } = params;
  const { title, error } = await fetchProjectTitle(projectId);
  if (error || !title) {
    return {
      title: "Text Editor",
      description: "Markdown editor workspace with file management",
    };
  }
  return {
    title: `${title} - Text Editor`,
    description: `Markdown editor workspace for project ${title}`,
  };
}

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
