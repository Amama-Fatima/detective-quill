import { useAuth } from "@/context/auth-context";
import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from "@detective-quill/shared-types";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  updateProject,
  changeProjectStatus,
} from "@/lib/backend-calls/projects";
import { requireAccessToken } from "@/lib/utils/utils";

export function useProjects() {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const createMutation = useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      const token = requireAccessToken(accessToken);
      const response = await createProject(data, token);
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success("Project created successfully");
        // setProjects((prev) => [...prev, response.data!]);
      }
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      projectId: string;
      updateData: UpdateProjectDto;
    }) => {
      const token = requireAccessToken(accessToken);
      const response = await updateProject(
        data.projectId,
        data.updateData,
        token,
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
      const token = requireAccessToken(accessToken);
      const response = await deleteProject(projectId, token);
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
      const token = requireAccessToken(accessToken);
      const response = await changeProjectStatus(
        data.projectId,
        data.status,
        token,
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
    createMutation,
    updateMutation,
    deleteMutation,
    changeStatusMutation,
  };
}
