"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DangerZoneCardProps {
  projectTitle: string;
  onDeleteProject: () => void;
}

export function DangerZoneCard({
  projectTitle,
  onDeleteProject,
}: DangerZoneCardProps) {
  return (
    <Card className="shadow-lg border-destructive/20">
      <CardHeader className="border-b border-destructive/10 bg-gradient-to-r from-destructive/5 to-transparent">
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-6 w-6 mr-3 text-destructive" />
          <div>
            <h3 className="text-xl font-serif text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground font-sans">
              Irreversible actions
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-destructive mb-2">
              Close Investigation
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete this case and all associated evidence. This
              action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Case
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Investigation</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{projectTitle}" and remove all
                    associated data including:
                    <br />• All case files and evidence
                    <br />• Team member access
                    <br />• Version history
                    <br />• Investigation notes
                    <br />
                    <br />
                    <strong>This action cannot be undone.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onDeleteProject}
                  >
                    Delete Investigation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
