import ErrorMsg from "@/components/error-msg";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import React from "react";


interface ProjectWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
  children: React.ReactNode;
}

const WorkspaceLayout = async ({
  params,
  children,
}: ProjectWorkspacePageProps) => {
  const supabase = await createSupabaseServerClient();

  const { projectId } = await params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to sign-in if not authenticated
  if (authError || !user) {
    redirect("/auth/sign-in");
  }

  const { data, error } = await supabase
    .from("projects")
    .select("title")
    .eq("id", projectId)
    // .eq("author_id", user.id)
    .single();

  if (error || !data) {
    return <ErrorMsg message="Failed to load project data." />;
  }

  return (
    <div>
      <div className="border-b border-border bg-gradient-to-r from-secondary-foreground via-card to-background shadow-sm">
        <h1 className="mystery-title text-center text-4xl mb-2">{data?.title}</h1>
      </div>
      {children}
    </div>
  );
};

export default WorkspaceLayout;
