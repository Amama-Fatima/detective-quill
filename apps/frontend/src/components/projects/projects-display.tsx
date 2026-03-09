import ProjectCard from "./project-card";
import { useSearchParams } from "next/navigation";
import { tab_message } from "@/constants/project-constants";
import NoProjectCard from "./no-project-card";
import { Project } from "@detective-quill/shared-types";
interface ProjectsDisplayProps {
  projects: Project[];
}

export default function ProjectsDisplay({ projects }: ProjectsDisplayProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const tabMeta = tab_message.find((m) => m.tab === tab);
  const title = tabMeta?.title ?? "Cases";
  const description =
    tabMeta?.description ??
    "The detective's desk is empty. Time to start a new investigation!";

  if (projects.length === 0) {
    return <NoProjectCard title={title} description={description} />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
