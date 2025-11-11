import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  AddMemberDto,
  ProjectMember,
  UpdateProjectDto,
} from "@detective-quill/shared-types";
import {
  updateProjectInfo,
  addProjectMember,
  removeProjectMember,
  deleteProject,
} from "@/lib/backend-calls/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useSettings(
  projectId: string,
  initialMembers: ProjectMember[] = []
) {
  const { session } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<ProjectMember[]>(initialMembers);
  const [updating, setUpdating] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  // Update project information
  const updateProject = async (data: UpdateProjectDto): Promise<boolean> => {
    if (!session?.access_token) return false;

    try {
      setUpdating(true);
      const response = await updateProjectInfo(
        projectId,
        data,
        session.access_token
      );

      if (response.success && response.data) {
        toast.success("Project updated successfully");
        return true;
      } else {
        toast.error(response.error || "Failed to update project");
        return false;
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Add new member
  const addMember = async (data: AddMemberDto): Promise<boolean> => {
    if (!session?.access_token) return false;

    try {
      setAddingMember(true);
      const response = await addProjectMember(
        projectId,
        data,
        session.access_token
      );

      if (response.success && response.data) {
        toast.success("Detective added successfully");
        setMembers((prev) => [...prev, response.data!]);
        return true;
      } else {
        toast.error(response.error || "Failed to add team member");
        return false;
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add team member");
      return false;
    } finally {
      setAddingMember(false);
    }
  };

  // Remove member
  const removeMember = async (memberId: string): Promise<boolean> => {
    if (!session?.access_token) return false;

    try {
      const response = await removeProjectMember(
        projectId,
        memberId,
        session.access_token
      );

      if (response.success) {
        toast.success("Detective removed successfully");
        setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
        return true;
      } else {
        toast.error(response.error || "Failed to remove team member");
        return false;
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove team member");
      return false;
    }
  };

  // Delete project
  const deleteProjectCompletely = async (): Promise<boolean> => {
    if (!session?.access_token) return false;

    try {
      const response = await deleteProject(projectId, session.access_token);

      if (response.success) {
        toast.success("Investigation deleted successfully");
        router.push("/projects");
        return true;
      } else {
        toast.error(response.error || "Failed to delete investigation");
        return false;
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete investigation");
      return false;
    }
  };

  return {
    members,
    updating,
    addingMember,
    updateProject,
    addMember,
    removeMember,
    deleteProject: deleteProjectCompletely,
  };
}
