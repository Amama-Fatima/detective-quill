import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useProject } from "@/hooks/projects/use-project";

export default function ChangeStateDropDown({
  projectId,
  status,
}: {
  projectId: string;
  status: "active" | "completed" | "archived";
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const { changeStatusMutation } = useProject();
  const loading = changeStatusMutation.isPending;

  const handleChangeState = async (
    status: "active" | "completed" | "archived",
  ) => {
    const response = await changeStatusMutation.mutateAsync({
      projectId,
      status,
    });
    if (response.success) {
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
          <DropdownMenuLabel className="text-xl font-semibold">
            Change State
          </DropdownMenuLabel>
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
}
