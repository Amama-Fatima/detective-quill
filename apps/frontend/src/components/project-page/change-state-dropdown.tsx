import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { changeProjectStatus } from "@/lib/backend-calls/projects";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

export default function ChangeStateDropDown({
  projectId,
  status,
}: {
  projectId: string;
  status: "active" | "completed" | "archived";
}) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const handleChangeState = async (
    status: "active" | "completed" | "archived"
  ) => {
    try {
      setLoading(true);
      const response = await changeProjectStatus(
        projectId,
        status,
        accessToken
      );
      console.log("Change status response:", response);
      toast.success(`Project status changed to ${status}`);
    } catch (error) {
      console.error("Error changing project status:", error);
      toast.error("Failed to change project status.");
    } finally {
      setLoading(false);
      setCurrentStatus(status);
    }
  };

  return (
    <div className="mt-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="border-2 border-secondary-foreground bg-secondary text-secondary-foreground cursor-pointer hover:text-secondary hover:bg-secondary-foreground shadow-lg">
            {loading ? "Loading..." : currentStatus.toUpperCase()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-secondary" align="start">
          <DropdownMenuLabel className="text-xl font-semibold">Change State</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => handleChangeState("active")}
              disabled={currentStatus === "active" || loading}
              className="disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleChangeState("completed")}
              disabled={currentStatus === "completed" || loading}
              className="disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleChangeState("archived")}
              disabled={currentStatus === "archived" || loading}
              className="disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Archived
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
