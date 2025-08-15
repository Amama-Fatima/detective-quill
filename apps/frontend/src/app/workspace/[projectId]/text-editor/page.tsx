import { ProjectLanding } from "@/components/editor-workspace/project-landing";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return <ProjectLanding projectId={projectId} />;
}
