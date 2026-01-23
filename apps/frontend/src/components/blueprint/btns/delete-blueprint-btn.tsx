"use client";
import React from "react";
import { useState } from "react";
import { Trash } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface DeleteBlueprintButtonProps {
  blueprintId: string;
}

export const DeleteBlueprintButton = ({
  blueprintId,
}: DeleteBlueprintButtonProps) => {
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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(blueprintId)}
              className="cursor-pointer"
            >
              Delete Blueprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
