// components/project-card.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  Save,
  X,
  BookOpen,
  FileText,
  Eye,
  MoreVertical,
  Target,
  Star,
  Archive,
  Clock,
} from "lucide-react";
import { ProjectResponse } from "@detective-quill/shared-types";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../ui/badge";

interface ProjectCardProps {
  project: ProjectResponse;
  onOpen: (projectTitle: string) => void;
  onUpdate: (
    projectId: string,
    data: { title: string; description: string }
  ) => Promise<boolean>;
  onDelete: (projectId: string) => Promise<boolean>;
}

const ProjectCard = ({
  project,
  onOpen,
  onUpdate,
  onDelete,
}: {
  project: any;
  onOpen: (id: string) => void;
  onUpdate: (id: string, data: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) => {
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
    <Card
      onClick={() => onOpen(project.id)}
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 bg-gradient-to-br from-card via-card to-card/50 hover:border-primary/30"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="font-serif text-lg group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </CardTitle>
              <Badge
                className={`text-xs case-file mt-1 ${getStatusColor(
                  project.status
                )}`}
              >
                {getStatusIcon(project.status)}
                <span className="ml-1">{project.status.toUpperCase()}</span>
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(project.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Open Case
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(project.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Close Case
              </DropdownMenuItem>
            </DropdownMenuContent> */}
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0" onClick={() => onOpen(project.id)}>
        <p className="text-sm text-muted-foreground noir-text mb-4 line-clamp-2">
          {project.description || "No case summary available..."}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Investigation Progress
            </span>
            <span className="font-mono text-xs">{project.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                {project.wordCount.toLocaleString()} words
              </div>
              <div className="flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                {project.chapters} chapters
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {project.lastActivity.toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
