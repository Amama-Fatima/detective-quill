import { Coffee } from "lucide-react";
import ProjectCard from "./project-card";
import { useSearchParams } from "next/navigation";
import { tab_message } from "@/constants/project-constants";
interface ProjectsDisplayProps {
  projects: any[];
}

const ProjectsDisplay = ({ projects }: ProjectsDisplayProps) => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  if (projects.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-muted bg-gradient-to-br from-card/70 to-chart-5/30">
        <div>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-8">
              <Coffee className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="mystery-title text-2xl">
                No{" "}
                {tab_message.find((message) => message.tab === tab)?.title ||
                  "Cases"}
              </h3>
              <p className="text-muted-foreground noir-text max-w-md">
                {tab_message.find((message) => message.tab === tab)
                  ?.description ||
                  "The detective's desk is empty. Time to start a new investigation!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectsDisplay;
