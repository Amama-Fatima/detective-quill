import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  AddMemberDto,
  ProjectMember,
} from "@detective-quill/shared-types";
import {
  addProjectMember,
  removeProjectMember,
} from "@/lib/backend-calls/members";
import { toast } from "sonner";
  
export function useSettings(
  projectId: string,
  initialMembers: ProjectMember[] = []
) {
  const { session } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>(initialMembers);
  const [addingMember, setAddingMember] = useState(false);

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

  return {
    members,
    addingMember,
    addMember,
    removeMember,
  };
}
