"use client";
import React from "react";
import { useState } from "react";
import { Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBlueprints } from "@/hooks/use-blueprints";

interface DeleteBlueprintButtonProps {
  blueprintId: string;
}

export const DeleteBlueprintButton = ({
  blueprintId,
}: DeleteBlueprintButtonProps) => {
  const { delete: deleteBlueprint, loading } = useBlueprints();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const onDelete = async (blueprintId: string) => {
    await deleteBlueprint(blueprintId);
    setOpenDialogId(null);
  };
  return (
    <div>
      <Dialog
        open={openDialogId === blueprintId}
        onOpenChange={(open) => setOpenDialogId(open ? blueprintId : null)}
      >
        <DialogTrigger asChild>
          <Trash className="h-5 w-5 cursor-pointer  hover:text-red-600" />
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5 text-red-500" />
              Delete Blueprint
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blueprint? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOpenDialogId(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(blueprintId)}
              className="cursor-pointer"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
