import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@detective-quill/shared-types";

interface WorkspaceHeaderProps {
  project: Project;
}

const ProjectWorkspaceHeader = ({ project }: WorkspaceHeaderProps) => {
  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-4">{project.title}</h1>

          <Tabs>
            <TabsList>
              <TabsTrigger value="main">
                <Link href={`/workspace/${project.id}`}>Main</Link>
              </TabsTrigger>
              <TabsTrigger value="blueprint">
                <Link href={`/workspace/${project.id}/blueprint`}>
                  Blueprint
                </Link>
              </TabsTrigger>
              <TabsTrigger value="text-editor">
                <Link href={`/workspace/${project.id}/text-editor`}>
                  Text Editor
                </Link>
              </TabsTrigger>
              <TabsTrigger value="visualization">
                <Link href={`/workspace/${project.id}/visualization`}>
                  Visualization
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspaceHeader;
