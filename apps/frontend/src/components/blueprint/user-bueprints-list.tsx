"use client";

import { Blueprint } from "@detective-quill/shared-types/api";
import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useBlueprints } from "@/hooks/blueprints/use-blueprints";
import BlueprintCard from "./blueprint-card";
import { useWorkspaceContext } from "@/context/workspace-context";
import NoBlueprints from "./no-blueprints";

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
      <NoBlueprints/>
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
