import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
  createBlueprint,
  updateBlueprintById,
  deleteBlueprintById,
} from "@/lib/backend-calls/blueprints";
import { useState } from "react";

export function useBlueprints() {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";
  const [loading, setLoading] = useState(false);

  const create = async (
    type: "character" | "timeline" | "item" | "location",
    projectId: string,
  ) => {
    setLoading(true);
    try {
      const result = await createBlueprint(accessToken, {
        type,
        project_id: projectId,
        title: "Untitled",
      });
      toast.success("Blueprint created successfully!");
      return result.data;
    } catch (error) {
      toast.error("Failed to create blueprint.");
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (blueprintId: string, newName: string) => {
    setLoading(true);
    try {
      const result = await updateBlueprintById(accessToken, blueprintId, {
        title: newName,
      });
      toast.success("Blueprint updated successfully!");
      return result.data;
    } catch (error) {
      toast.error("Failed to update blueprint.");
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const delete_ = async (blueprintId: string) => {
    setLoading(true);
    try {
      await deleteBlueprintById(accessToken, blueprintId);
      toast.success("Blueprint deleted successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to delete blueprint.");
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, delete: delete_, loading };
}
