import React from "react";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import type { Project } from "@detective-quill/shared-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils/utils";

interface RecentProjectsProps {
  projects: Project[];
}

const RecentProjects = ({ projects }: RecentProjectsProps) => {
  return (
    <Card className="border-border/70 shadow-md">
      <CardHeader>
        <CardTitle>Recent Active Projects</CardTitle>
        <CardDescription>
          Pick up where you left off in your latest active cases
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
              className="group rounded-xl border border-border/70 bg-sidebar p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h3 className="line-clamp-1 text-base font-semibold group-hover:text-primary">
                    {project.title}
                  </h3>
                </div>
              </div>

              <p className="line-clamp-2 text-sm text-muted-foreground">
                {project.description || "No description added yet."}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Updated {formatDate(project.updated_at)}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentProjects;
