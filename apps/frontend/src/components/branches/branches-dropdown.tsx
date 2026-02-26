// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@radix-ui/react-dropdown-menu";
// import { Branch } from "@detective-quill/shared-types";

// interface BranchesDropdownProps {
//   branches: Branch[];
//   activeBranchId?: string | null;
// }

// const BranchesDropdown = ({
//   branches,
//   activeBranchId,
// }: BranchesDropdownProps) => {
//   const [open, setOpen] = useState(false);

//   const initialSelectedBranch = useMemo(() => {
//     if (!branches || branches.length === 0) {
//       return null;
//     }

//     if (activeBranchId) {
//       const active = branches.find((branch) => branch.id === activeBranchId);
//       if (active) return active;
//     }

//     const defaultBranch = branches.find((branch) => branch.is_default);
//     if (defaultBranch) return defaultBranch;

//     return branches[0];
//   }, [branches, activeBranchId]);

//   const [selectedBranch, setSelectedBranch] = useState<Branch | null>(
//     initialSelectedBranch,
//   );

//   useEffect(() => {
//     setSelectedBranch(initialSelectedBranch);
//   }, [initialSelectedBranch]);

//   const handleSelectBranch = (branch: Branch) => {
//     setSelectedBranch(branch);
//     setOpen(false);
//   };

//   return (
//     <DropdownMenu open={open} onOpenChange={setOpen}>
//       <DropdownMenuTrigger asChild>
//         <button className="border-0 cursor-pointer bg-primary px-4 py-2 rounded-md text-white hover:bg-primary/90 shadow-lg text-sm font-medium inline-flex items-center gap-2">
//           <span>{selectedBranch?.name || "Select branch"}</span>
//         </button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         align="start"
//         className="w-56 bg-card border rounded-md shadow-lg py-1"
//       >
//         {branches.length > 0 ? (
//           branches.map((branch) => (
//             <DropdownMenuItem
//               key={branch.id}
//               onClick={() => handleSelectBranch(branch)}
//               className="px-3 py-2 cursor-pointer hover:bg-accent/60 flex items-center justify-between text-sm"
//             >
//               <span>{branch.name}</span>
//               {branch.is_active && (
//                 <span className="ml-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">
//                   Active
//                 </span>
//               )}
//             </DropdownMenuItem>
//           ))
//         ) : (
//           <div className="px-3 py-2 text-sm text-muted-foreground">
//             No branches found
//           </div>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

// export default BranchesDropdown;
