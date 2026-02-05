import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateProjectDto, Project } from "@detective-quill/shared-types";
import { useProjects } from "@/hooks/use-projects";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export default function CreateProjectDialog({
  open,
  onOpenChange,
  setProjects,
}: CreateProjectDialogProps) {
  const [formData, setFormData] = useState<CreateProjectDto>({
    title: "",
    description: "",
  });
  const { createMutation } = useProjects();
  const creating = createMutation.isPending;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const response = await createMutation.mutateAsync(formData);
    if (response.success) {
      setProjects((prev) => [...prev, response.data!]);
      setFormData({ title: "", description: "" });
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!creating) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setFormData({ title: "", description: "" });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl">
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-secondary-foreground text-[0.9rem]">
              Start a new writing project. Give it a name and description to get
              started.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-[1rem]">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter project title"
                disabled={creating}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[1rem]">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your project..."
                rows={3}
                disabled={creating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={creating}
              className="shadow-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="shadow-lg bg-primary hover:bg-primary/90 cursor-pointer"
              disabled={creating || !formData.title.trim()}
            >
              {creating ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
