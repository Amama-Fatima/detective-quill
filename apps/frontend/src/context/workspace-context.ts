"use client";

import React, { createContext, useContext } from "react";

interface WorkspaceContextValue {
  projectId: string;
  activeBranchId: string | null;
  isOwner: boolean;
  isActive: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

interface WorkspaceContextProviderProps extends WorkspaceContextValue {
  children: React.ReactNode;
}

export function WorkspaceContextProvider({
  children,
  projectId,
  activeBranchId,
  isOwner,
  isActive,
}: WorkspaceContextProviderProps) {
  return React.createElement(
    WorkspaceContext.Provider,
    { value: { projectId, activeBranchId, isOwner, isActive } },
    children,
  );
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext must be used within WorkspaceContext");
  }
  return ctx;
}
