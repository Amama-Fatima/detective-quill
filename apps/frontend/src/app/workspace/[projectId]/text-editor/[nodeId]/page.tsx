import TextEditorContainer from "@/components/editor-workspace/editor/text-editor-container";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import { fetchNode } from "@/lib/supabase-calls/editor-workspace";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";
import { getUserFromCookie } from "@/lib/utils/get-user";

interface NodePageProps {
  params: Promise<{
    projectId: string;
    nodeId: string;
  }>;
}

export default async function NodePage({ params }: NodePageProps) {
  const { projectId, nodeId } = await params;
  const supabase = await createSupabaseServerClient();
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const node = await fetchNode(supabase, nodeId);
  const { isActive, author_id } = await getProjectStatusAndAuthor(
    projectId,
    supabase,
  );
  const isOwner = user.sub === author_id;

  return (
    <TextEditorContainer
      projectId={projectId}
      node={node}
      isActive={isActive}
      isOwner={isOwner}
    />
  );
}
