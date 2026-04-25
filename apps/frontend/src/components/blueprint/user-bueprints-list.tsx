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
      <div className="flex flex-col items-center justify-center gap-4 py-16 border border-border/60 border-dashed bg-muted/20">
        <div className="p-6 border border-border/50 bg-card">
          <FileText className="h-8 w-8 text-primary/40" />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="font-playfair-display text-[18px] font-bold text-primary">
            No Blueprints Yet
          </h3>
          <p className="noir-text text-[14px] text-muted-foreground max-w-sm">
            Create a blueprint to start organising your story structures,
            character sheets, and scene templates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6">
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
  );
};
