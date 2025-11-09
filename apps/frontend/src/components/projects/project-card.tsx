// components/project-card.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, FileText, Target, Star, Archive, Clock } from "lucide-react";
import { ProjectResponse } from "@detective-quill/shared-types";
import { Badge } from "../ui/badge";
import Link from "next/link";

interface ProjectCardProps {
  project: ProjectResponse;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent text-accent-foreground";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Target className="h-3 w-3" />;
      case "completed":
        return <Star className="h-3 w-3" />;
      case "archived":
        return <Archive className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50  bg-gradient-to-tl from-background via-background to-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors line-clamp-1">
                <Link href={`/workspace/${project.id}`}>{project.title}</Link>
              </CardTitle>
              <Badge className="text-xs case-file mt-1">
                <Archive className="h-2 w-2" />
                <span className="ml-1">Archived</span>
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground noir-text mb-4 line-clamp-2">
          {project.description || "No case summary available..."}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                Word Count words
              </div>
              <div className="flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                Chapter umber chapters
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {project.updated_at}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
