import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  ProjectResponse,
  CreateProjectDto,
  UpdateProjectDto,
} from "@detective-quill/shared-types";
import {
  createProject,
  getProjects,
  deleteProject,
  updateProject,
} from "@/lib/backend-calls/projects";
import { toast } from "sonner";

export function useProjects(initialProjects?: ProjectResponse[]) {
  const { session } = useAuth();
  const [projects, setProjects] = useState<ProjectResponse[]>(
    initialProjects || []
  );
  const [loading, setLoading] = useState(!initialProjects);
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await getProjects(session.access_token);

      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        toast.error(response.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async (data: CreateProjectDto) => {
    if (!session?.access_token) return false;

    try {
      setCreating(true);
      const response = await createProject(data, session.access_token);

      if (response.success && response.data) {
        toast.success("Project created successfully");
        setProjects((prev) => [response.data!, ...prev]);
        return true;
      } else {
        toast.error(response.error || "Failed to create project");
        return false;
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
      return false;
    } finally {
      setCreating(false);
    }
  };

  const updateExistingProject = async (
    projectId: string,
    data: UpdateProjectDto
  ) => {
    if (!session?.access_token) return false;

    try {
      const response = await updateProject(
        projectId,
        data,
        session.access_token
      );

      if (response.success && response.data) {
        toast.success("Project updated successfully");
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? response.data! : p))
        );
        return true;
      } else {
        toast.error(response.error || "Failed to update project");
        return false;
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
      return false;
    }
  };

  const deleteExistingProject = async (projectId: string) => {
    if (!session?.access_token) return false;

    try {
      const response = await deleteProject(projectId, session.access_token);

      if (response.success) {
        toast.success("Project deleted successfully");
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        return true;
      } else {
        toast.error(response.error || "Failed to delete project");
        return false;
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
      return false;
    }
  };

  // Only fetch if we don't have initial projects and session exists
  useEffect(() => {
    if (!initialProjects && session) {
      fetchProjects();
    }
  }, [session, initialProjects]);

  return {
    projects,
    loading,
    creating,
    fetchProjects,
    createProject: createNewProject,
    updateProject: updateExistingProject,
    deleteProject: deleteExistingProject,
  };
}
