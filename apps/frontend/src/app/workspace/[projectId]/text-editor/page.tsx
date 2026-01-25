// todo: you get error cz of using button and redirect on server side i think, so fix this
import { Button } from "@/components/ui/button";
import { fetchProject } from "@/lib/supabase-calls/editor-workspace";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { FileText, FolderOpen, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";
import { getUserFromCookie } from "@/lib/utils/get-user";

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

  const { isActive, author_id } = await getProjectStatusAndAuthor(
    projectId,
    supabase,
  );
  const userId = user.sub;
  const isOwner = author_id === userId;
  let project;

  try {
    project = await fetchProject(supabase, projectId);
  } catch (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="rounded-full bg-muted p-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="noir-text text-xl font-semibold">
              Project not found
            </h2>
            <p className="noir-text text-sm text-muted-foreground">
              The project you're looking for doesn't exist or you don't have
              access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="rounded-full bg-primary/10 p-8">
          <FolderOpen className="h-16 w-16 text-primary mx-auto" />
        </div>

        <div className="space-y-2">
          <h2 className="noir-text text-2xl font-bold">{project.title}</h2>
          {project.description && (
            <p className="noir-text-muted-foreground">{project.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <p className="noir-text text-sm text-muted-foreground">
            Select a file from the sidebar to start editing, or create a new
            file to begin writing.
          </p>

          <div className="flex justify-center">
            <Button
              className="gap-2 cursor-pointer"
              disabled={!isOwner || !isActive}
            >
              <Plus className="h-4 w-4" />
              Create a file
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
