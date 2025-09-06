"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Edit3, Save, X, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils/utils";

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ProjectDetailsCardProps {
  project: Project;
  isOwner: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  onSave: () => void;
  updating: boolean;
}

export function ProjectDetailsCard({
  project,
  isOwner,
  isEditing,
  setIsEditing,
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
  onSave,
  updating,
}: ProjectDetailsCardProps) {
  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-3 text-primary" />
            <div>
              <h3 className="text-xl font-serif">Case Details</h3>
              <p className="text-sm text-muted-foreground font-sans">
                Basic information about your investigation
              </p>
            </div>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={updating}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isEditing && isOwner ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Case Title</Label>
              <Input
                id="title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="mt-1"
                disabled={updating}
              />
            </div>
            <div>
              <Label htmlFor="description">Case Description</Label>
              <Textarea
                id="description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="mt-1"
                rows={4}
                placeholder="Brief summary of your mystery..."
                disabled={updating}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button onClick={onSave} disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Title
              </Label>
              <p className="font-serif text-lg mt-1">{project.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Description
              </Label>
              <p className="noir-text mt-1">
                {project.description || "No description provided"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Created
                </Label>
                <p className="mt-1">{formatDate(project.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </Label>
                <p className="mt-1">{formatDate(project.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
