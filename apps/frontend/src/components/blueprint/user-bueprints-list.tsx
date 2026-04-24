// user-blueprints-list.tsx
"use client";

import { Blueprint } from "@detective-quill/shared-types/api";
import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useBlueprints } from "@/hooks/blueprints/use-blueprints";
import BlueprintCard from "./blueprint-card";
import { useWorkspaceContext } from "@/context/workspace-context";

interface UserBlueprintsListProps {
  blueprints: Blueprint[];
  projectId: string;
}

export const UserBlueprintsList = ({
  blueprints: initialBlueprints,
  projectId,
}: UserBlueprintsListProps) => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);

  const { deleteMutation } = useBlueprints();
  const loading = deleteMutation.isPending;

  const onDelete = async (blueprintId: string) => {
    await deleteMutation.mutateAsync(blueprintId);
    setBlueprints((prev) => prev.filter((bp) => bp.id !== blueprintId));
  };

  const { isOwner, isActive } = useWorkspaceContext();

  if (blueprints.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-muted bg-gradient-to-br from-card/70 to-chart-5/30">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-8">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="mystery-title text-2xl">No Blueprints</h3>
            <p className="text-muted-foreground noir-text max-w-md">
              You haven't created any blueprints yet. Create a blueprint to
              start organizing your thoughts and story elements!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-8">
        {blueprints.map((blueprint) => (
          <BlueprintCard
            key={blueprint.id}
            blueprint={blueprint}
            projectId={projectId}
            isOwner={isOwner}
            isActive={isActive}
            onDelete={onDelete}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};
