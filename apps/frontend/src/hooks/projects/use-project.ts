import { useAuth } from "@/context/auth-context";
import { Project, UpdateProjectDto } from "@detective-quill/shared-types";
import {
  deleteProject,
  updateProject,
  changeProjectStatus,
} from "@/lib/backend-calls/projects";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export function useProject() {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  if (!accessToken) {
    throw new Error("No access token found in session");
  }

  const updateMutation = useMutation({
    mutationFn: async (data: {
      projectId: string;
      updateData: UpdateProjectDto;
    }) => {
      const response = await updateProject(
        data.projectId,
        data.updateData,
        accessToken,
      );
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success("Project updated successfully");
      }
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await deleteProject(projectId, accessToken);
      return response;
    },
    onSuccess: (response, projectId) => {
      if (response.success) {
        toast.success("Project deleted successfully");
      }
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: async (data: {
      projectId: string;
      status: Project["status"];
    }) => {
      const response = await changeProjectStatus(
        data.projectId,
        data.status,
        accessToken,
      );
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success("Project status changed successfully");
      }
    },
    onError: () => {
      toast.error("Failed to change project status");
    },
  });

  return {
    updateMutation,
    deleteMutation,
    changeStatusMutation,
  };
}
