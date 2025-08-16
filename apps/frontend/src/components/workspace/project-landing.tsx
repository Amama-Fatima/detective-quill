"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getProject } from "@/lib/backend-calls/projects";
import { ProjectResponse } from "@detective-quill/shared-types";
import { toast } from "sonner";
import { FileText, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectLandingProps {
  projectId: string;
}

export function ProjectLanding({ projectId }: ProjectLandingProps) {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      if (!session?.access_token || !projectId) return;

      try {
        const response = await getProject(projectId, session.access_token);
        if (response.success && response.data) {
          setProject(response.data);
        } else {
          toast.error("Failed to load project");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, session?.access_token]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 bg-muted rounded-full mx-auto animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded mx-auto animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
