import { TextEditorContainer } from "@/components/editor-workspace/editor/text-editor-container";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import { fetchNode } from "@/lib/server/editor-workspace";

interface NodePageProps {
  params: Promise<{
    projectId: string;
    nodeId: string;
  }>;
}

export default async function NodePage({ params }: NodePageProps) {
  const { projectId, nodeId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user?.id || authError) {
    redirect("/auth/login");
  }

  const node = await fetchNode(supabase, nodeId, user.id);

  return <TextEditorContainer projectId={projectId} node={node} />;
}
