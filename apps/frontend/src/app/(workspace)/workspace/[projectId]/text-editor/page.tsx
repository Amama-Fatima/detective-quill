// todo: you get error cz of using button and redirect on server side i think, so fix this

import { getProjectById } from "@/lib/supabase-calls/editor-workspace";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { notFound, redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/utils/get-user";
import ErrorMsg from "@/components/error-msg";
import { CaseFileIcon } from "@/components/icons/case-file-icon";

export const metadata = {
  title: "Text Editor",
  description: "Text Editor page for editing text-based nodes",
};

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { project, error: projectError } = await getProjectById(
    projectId,
    supabase,
  );

  if (projectError) {
    return <ErrorMsg message="Error fetching project" />;
  }

  if (!project) {
    return notFound();
  }

  return (
    <div className="flex h-full items-center justify-center ">
      <div className="text-center space-y-6 max-w-md">
        <div className="rounded-full bg-primary text-background mx-auto h-20 w-20 flex items-center justify-center">
          <CaseFileIcon size={42} className="block" />
        </div>

        <div className="space-y-2">
          <h2 className="mystery-title text-2xl font-bold">{project.title}</h2>
          {project.description && (
            <p className="noir-text-muted-foreground">{project.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <p className="noir-text text-md text-muted-foreground">
            Select a file from the sidebar to start editing, or create a new
            file to begin writing.
          </p>
        </div>
      </div>
    </div>
  );
}
