"use client";
import { Blueprint } from "@detective-quill/shared-types/api";
import Link from "next/dist/client/link";
import React from "react";
import { useState } from "react";
import { Tag, FileText, Trash } from "lucide-react";
import { deleteBlueprintById } from "@/lib/backend-calls/blueprints";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
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
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const onDelete = async (blueprintId: string) => {
    if (!accessToken) {
      toast.error("No access token found. Please log in again.");
      return;
    }
    try {
      await deleteBlueprintById(accessToken, blueprintId);
      toast.success("Blueprint deleted successfully");
      setOpenDialogId(null);
    } catch (error) {
      toast.error("Error deleting blueprint");
      console.error(error);
    }
  };

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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-200">Your Blueprints</h2>
      </div>

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {blueprints.map((blueprint) => (
          <Card
            key={blueprint.id}
            className="group hover:shadow-lg transition-all duration-200 hover:border-blue-300 relative"
          >
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center ">
                    <Link
                      href={`/workspace/${projectId}/blueprint/${blueprint.id}?type=${blueprint.type}`}
                      className="block w-full"
                    >
                      <CardTitle className="text-lg font-semibold text-gray-100 group-hover:text-blue-600 transition-colors line-clamp-1">
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
