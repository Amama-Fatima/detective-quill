"use client";

import { Blueprint } from "@detective-quill/shared-types/api";
import Link from "next/dist/client/link";
import React, { useState } from "react";
import { Tag, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getBlueprintTypeColor } from "@/lib/utils/blueprint-utils";
import { DeleteBlueprintButton } from "./btns/delete-blueprint-btn";
import { useBlueprints } from "@/hooks/blueprints/use-blueprints";

interface UserBlueprintsListProps {
  blueprints: Blueprint[];
  projectId: string;
  isOwner: boolean;
  isActive: boolean;
}

export const UserBlueprintsList = ({
  blueprints: initialBlueprints,
  projectId,
  isOwner,
  isActive,
}: UserBlueprintsListProps) => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);

  const { deleteMutation } = useBlueprints();
  const loading = deleteMutation.isPending;

  const onDelete = async (blueprintId: string) => {
    await deleteMutation.mutateAsync(blueprintId);
    setBlueprints((prev) => prev.filter((bp) => bp.id !== blueprintId));
  };

  if (blueprints.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-muted bg-gradient-to-br from-card/70 to-chart-5/30">
        <div>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {blueprints.map((blueprint) => (
          <Card
            key={blueprint.id}
            className="group hover:shadow-lg transition-all duration-200 relative"
          >
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center ">
                    <Link
                      href={`/workspace/${projectId}/blueprint/${blueprint.id}?type=${blueprint.type}`}
                      className="block w-full"
                    >
                      <CardTitle className="text-lg font-semibold transition-colors line-clamp-1">
                        {blueprint.title}
                      </CardTitle>
                    </Link>
                    {isOwner && isActive && (
                      <DeleteBlueprintButton
                        blueprintId={blueprint.id}
                        onDelete={onDelete}
                        loading={loading}
                      />
                    )}{" "}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`${getBlueprintTypeColor(
                  blueprint.type,
                )} flex justify-items-center align-middle gap-2 items-center`}
              >
                <>
                  <Tag />
                  <p className="case-file text-lg font-medium">
                    {blueprint.type}
                  </p>
                </>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
