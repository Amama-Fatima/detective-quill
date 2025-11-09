import { Blueprint } from "@detective-quill/shared-types/api";
import Link from "next/dist/client/link";
import React from "react";
import { Tag, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getBlueprintTypeColor } from "@/lib/utils/blueprint-utils";
import { DeleteBlueprintButton } from "./delete-blueprint-btn";

interface UserBlueprintsListProps {
  blueprints: Blueprint[];
  projectId: string;
}

export const UserBlueprintsList = ({
  blueprints,
  projectId,
}: UserBlueprintsListProps) => {
  if (blueprints.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto max-w-md">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No blueprints yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first blueprint to organize and reuse
            your designs.
          </p>
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
                    <DeleteBlueprintButton blueprintId={blueprint.id} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`${getBlueprintTypeColor(
                  blueprint.type
                )} flex justify-items-center align-middle gap-2 items-center`}
              >
                <>
                  <Tag />
                  <p className="text-lg font-medium">{blueprint.type}</p>
                </>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
