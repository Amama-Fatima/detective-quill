"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Branch } from "@detective-quill/shared-types";

interface BranchesDropdownProps {
  branches: Branch[];
}

const BranchesDropdown = ({
  branches,
}: BranchesDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(
    branches.length > 0 ? branches[0] : null,
  );

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="border-0 cursor-pointer bg-primary px-4 py-2 rounded-md text-white hover:bg-primary/90 shadow-lg">
          {selectedBranch?.name || "Select Branch"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 bg-card border rounded-md shadow-lg"
      >
        {branches.length > 0 ? (
          branches.map((branch) => (
            <DropdownMenuItem
              key={branch.id}
              onClick={() => handleSelectBranch(branch)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
            >
              <span className="text-sm">{branch.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500">
            No branches found
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BranchesDropdown;
