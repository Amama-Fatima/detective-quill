"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookOpen, Plus } from "lucide-react";

interface ProjectLandingProps {
  projectName: string;
}

export function ProjectLanding({ projectName }: ProjectLandingProps) {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 bg-muted rounded-full mx-auto animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded mx-auto animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="rounded-full bg-muted p-8 mx-auto w-fit">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{projectName}</h1>
          <p className="text-muted-foreground">
            Start writing your story by creating your first chapter.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => {
              // This will be handled by the sidebar's create chapter functionality
              // For now, we can show a message
              toast.info("Use the sidebar to create a new chapter");
            }}
          >
            <Plus className="h-5 w-5" />
            Create First Chapter
          </Button>

          <p className="text-sm text-muted-foreground">
            Or use the sidebar to manage your chapters
          </p>
        </div>
      </div>
    </div>
  );
}
