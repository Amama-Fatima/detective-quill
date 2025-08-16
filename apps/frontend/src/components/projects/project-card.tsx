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
} from "lucide-react";
import { ProjectResponse } from "@detective-quill/shared-types";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: ProjectResponse;
  onOpen: (projectTitle: string) => void;
  onUpdate: (
    projectId: string,
    data: { title: string; description: string }
  ) => Promise<boolean>;
  onDelete: (projectId: string) => Promise<boolean>;
}

export function ProjectCard({
  project,
  onOpen,
  onUpdate,
  onDelete,
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: project.title,
    description: project.description || "",
  });

  const handleSave = async () => {
    if (!editForm.title.trim()) return;

    const success = await onUpdate(project.id, editForm);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      title: project.title,
      description: project.description || "",
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const success = await onDelete(project.id);
    if (success) {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  if (isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <Input
            value={editForm.title}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, title: e.target.value }))
            }
            className="text-lg font-semibold"
            placeholder="Project title"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={editForm.description}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Project description (optional)"
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:border-gray-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-blue-600 hover:text-blue-700 cursor-pointer truncate">
                <button
                  onClick={() => onOpen(project.id)}
                  className="text-left hover:underline"
                >
                  {project.title}
                </button>
              </CardTitle>
              {project.description && (
                <CardDescription className="mt-2 line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(project.id)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleting(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Updated{" "}
                {formatDate(project.updated_at || project.created_at || "")}
              </div>
            </div>

            <Button
              onClick={() => onOpen(project.id)}
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
