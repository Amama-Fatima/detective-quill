import { getEditorWorkspaceData } from "@/lib/supabase-calls/editor-workspace";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/utils/get-user";
import KnowledgeGraphLayoutWrapper from "@/components/knowledge-graph/knowledge-graph-layout-wrapper";

interface KnowledgeGraphLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function KnowledgeGraphLayout({
  children,
  params,
}: KnowledgeGraphLayoutProps) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/auth/sign-in");
  }

  try {
    const { project, nodes } = await getEditorWorkspaceData(
      supabase,
      projectId,
    );

    return (
      <KnowledgeGraphLayoutWrapper
        project={project}
        initialNodes={nodes}
        projectId={projectId}
      >
        {children}
      </KnowledgeGraphLayoutWrapper>
    );
  } catch (error) {
    console.error("Knowledge graph layout error:", error);
    return <>{children}</>;
  }
}
