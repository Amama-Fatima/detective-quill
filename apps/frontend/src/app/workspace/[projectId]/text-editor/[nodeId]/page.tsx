import TextEditorContainer from "@/components/editor-workspace/editor/text-editor-container";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";

interface NodePageProps {
  params: Promise<{
    projectId: string;
    nodeId: string;
  }>;
}

export default async function NodePage({ params }: NodePageProps) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user?.id || authError) {
    redirect("/auth/sign-in");
  }

  const { isActive, author_id } = await getProjectStatusAndAuthor(
    projectId,
    supabase
  );
  const isOwner = user.id === author_id;

  return <TextEditorContainer isActive={isActive} isOwner={isOwner} />;
}
