import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// todo: add functionality to change project state

const ChangeStateDropDown = () => {
  return (
    <div className="mt-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="border-2 border-secondary-foreground bg-secondary text-secondary-foreground cursor-pointer hover:text-secondary hover:bg-secondary-foreground shadow-lg">
            Change Project State
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Change State</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>Active</DropdownMenuItem>
            <DropdownMenuItem>Completed</DropdownMenuItem>
            <DropdownMenuItem>Archived</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChangeStateDropDown;
