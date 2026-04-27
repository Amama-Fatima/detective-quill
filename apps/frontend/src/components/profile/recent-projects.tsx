import React from "react";
import Link from "next/link";
import type { Project } from "@detective-quill/shared-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "date-fns";
import { CaseFileIcon } from "../icons/case-file-icon";
import { ClockIcon } from "../icons/clock-icon";
import ProjectRow from "../projects/project-row";

interface RecentProjectsProps {
  projects: Project[];
}

const RecentProjects = ({ projects }: RecentProjectsProps) => {
  return (
    <Card className="border shadow-md rounded-lg">
      <CardHeader>
        <CardTitle className="mystery-title text-primary">
          Recent Active Projects
        </CardTitle>
        <CardDescription className="noir-text text-md flex items-center gap-1 justify-between">
          Pick up where you left off in your latest active cases
          <Link
            href="/projects"
            className="font-bold font-playfair-display text-primary hover:underline block"
          >
            See All Projects
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {projects.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-border/70 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No active projects yet.
          </div>
        ) : (
          projects.map((project, index) => (
            <div className="border" key={project.id}>
              <ProjectRow  project={project} index={index} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentProjects;
