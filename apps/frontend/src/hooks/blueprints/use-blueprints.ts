import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
  createBlueprint,
  updateBlueprintById,
  deleteBlueprintById,
} from "@/lib/backend-calls/blueprints";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBlueprints() {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const createMutation = useMutation({
    mutationFn: async (data: {
      type: "character" | "timeline" | "item" | "location";
      project_id: string;
    }) => {
      const response = await createBlueprint(accessToken, {
        ...data,
        title: "Untitled",
      });
      return response.data?.id;
    },
    onSuccess: () => {
      toast.success("Blueprint created successfully!");
    },
    onError: () => {
      toast.error("Failed to create blueprint.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { blueprintId: string; newName: string }) => {
      return await updateBlueprintById(accessToken, data.blueprintId, {
        title: data.newName,
      });
    },
    onSuccess: () => {
      toast.success("Blueprint updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update blueprint.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (blueprintId: string) => {
      return deleteBlueprintById(accessToken, blueprintId);
    },
    onSuccess: () => {
      toast.success("Blueprint deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete blueprint.");
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
