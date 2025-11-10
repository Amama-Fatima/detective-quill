import { Coffee } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import ProjectCard from "./project-card";

interface ProjectsDisplayProps {
  projects: any[];
  onOpenProject: (projectId: string) => void;
  onUpdateProject: (
    projectId: string,
    data: { title: string; description: string }
  ) => Promise<boolean>;
  onDeleteProject: (projectId: string) => Promise<boolean>;
}

const ProjectsDisplay = ({
  projects,
  onOpenProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectsDisplayProps) => {
  if (projects.length === 0) {
    return (
      <Card className="text-center py-16 border-dashed border-2 border-muted bg-gradient-to-br from-muted/20 to-muted/5">
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-8">
              <Coffee className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="mystery-title text-2xl">No Active Cases</h3>
              <p className="text-muted-foreground noir-text max-w-md">
                The detective's desk is empty. Time to start a new investigation
                and uncover the truth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
        />
      ))}
    </div>
  );
};

export default ProjectsDisplay;
