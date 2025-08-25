// todo: you get error cz of using button and redirect on server side i think, so fix this
import { Button } from "@/components/ui/button";
import { fetchProject } from "@/lib/server/editor-workspace";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { FileText, FolderOpen, Plus } from "lucide-react";
import { redirect } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const project = await fetchProject(supabase, projectId, user.id);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="rounded-full bg-muted p-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Project not found</h2>
            <p className="text-sm text-muted-foreground">
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
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a file from the sidebar to start editing, or create a new
            file to begin writing.
          </p>

          <div className="flex justify-center">
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              Create your first file
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
