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

interface RecentProjectsProps {
  projects: Project[];
}

const RecentProjects = ({ projects }: RecentProjectsProps) => {
  return (
    <Card className="border shadow-md rounded-lg">
      <CardHeader>
        <CardTitle className="mystery-title text-primary">Recent Active Projects</CardTitle>
        <CardDescription className="noir-text text-md flex items-center gap-1 justify-between">
          Pick up where you left off in your latest active cases

          <Link href="/cases" className="font-bold font-playfair-display text-primary hover:underline block">
            See All Projects
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">
        {projects.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-border/70 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No active projects yet.
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/workspace/${project.id}`}
              className="group rounded-lg border border-border/70 bg-sidebar p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-background p-2 text-primary transition-colors group-hover:bg-primary/10">
                    <CaseFileIcon />
                  </div>
                  <h3 className="line-clamp-1 text-base font-semibold group-hover:text-primary">
                    {project.title}
                  </h3>
                </div>
              </div>

              <p className="line-clamp-2 text-md text-muted-foreground min-h-[5rem] mt-3">
                {project.description || "No description added yet."}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <ClockIcon />
                Updated {project.updated_at ? formatDate(new Date(project.updated_at), "PPP") : "Never"}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentProjects;
