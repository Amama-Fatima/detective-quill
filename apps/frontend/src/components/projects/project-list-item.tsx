import React from "react";
import { Card, CardContent } from "../ui/card";
import {
  BookOpen,
  Clock,
  Edit,
  Eye,
  FileText,
  MoreVertical,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const ProjectListItem = ({
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
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-r from-card via-card to-card/50">
      <CardContent className="p-6" onClick={() => onOpen(project.id)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-serif font-semibold text-lg truncate">
                  {project.title}
                </h3>
                <Badge
                  className={`text-xs case-file ${
                    project.status === "active"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {project.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground noir-text mb-2 line-clamp-1">
                {project.description || "No case summary available..."}
              </p>

              <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  {project.wordCount.toLocaleString()} words
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {project.chapters} chapters
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {project.progress}% complete
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {project.lastActivity.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-24 bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectListItem;
