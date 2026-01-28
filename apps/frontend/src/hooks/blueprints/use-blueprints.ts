import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { deleteBlueprintById } from "@/lib/backend-calls/blueprints";
import { useMutation } from "@tanstack/react-query";
import { Blueprint } from "@detective-quill/shared-types";

export function useBlueprints(initialBlueprints: Blueprint[]) {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);

  const deleteMutation = useMutation({
    mutationFn: (blueprintId: string) => {
      return deleteBlueprintById(accessToken, blueprintId);
    },
    onSuccess: (_response, blueprintId) => {
      toast.success("Blueprint deleted successfully!");
      setBlueprints((prev) => prev.filter((bp) => bp.id !== blueprintId));
    },
    onError: () => {
      toast.error("Failed to delete blueprint.");
    },
  });

  return { blueprints, deleteMutation };
}
