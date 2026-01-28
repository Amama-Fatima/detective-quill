import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Project, CreateProjectDto } from "@detective-quill/shared-types";
import { createProject } from "@/lib/backend-calls/projects";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export function useProjects(initialProjects?: Project[]) {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const accessToken = session?.access_token || "";

  if (!accessToken) {
    throw new Error("No access token found in session");
  }

  const createMutation = useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      const response = await createProject(data, accessToken);
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success("Project created successfully");
        setProjects((prev) => [...prev, response.data!]);
      }
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  return {
    projects,
    createMutation,
  };
}
