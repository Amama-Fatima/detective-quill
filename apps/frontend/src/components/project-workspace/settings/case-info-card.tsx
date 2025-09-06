"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { formatDate } from "@/lib/utils/utils";

interface Project {
  id: string;
  is_active: boolean | null;
  created_at: string | null;
}

interface CaseInfoCardProps {
  project: Project;
  teamSize: number;
}

export function CaseInfoCard({ project, teamSize }: CaseInfoCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          <span className="font-serif">Case Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Case ID</span>
            <span className="font-mono text-xs">{project.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Team Size</span>
            <span>{teamSize} detectives</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={project.is_active ? "default" : "secondary"}>
              {project.is_active ? "Active" : "Closed"}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
