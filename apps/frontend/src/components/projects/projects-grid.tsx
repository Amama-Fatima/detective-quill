import { ProjectResponse } from "@detective-quill/shared-types";
import { ProjectCard } from "./project-card";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

interface ProjectsGridProps {
  projects: ProjectResponse[];
  loading: boolean;
  onOpenProject: (projectTitle: string) => void;
  onUpdateProject: (
    projectId: string,
    data: { title: string; description: string }
  ) => Promise<boolean>;
  onDeleteProject: (projectId: string) => Promise<boolean>;
}

export function ProjectsGrid({
  projects,
  loading,
  onOpenProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-gray-100 p-6">
              <FolderOpen className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                No projects yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Create your first project to start organizing your writing work.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpenProject}
          onUpdate={onUpdateProject}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
}
