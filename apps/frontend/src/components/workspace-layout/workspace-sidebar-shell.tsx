"use client";

import { useState } from "react";
import WorkspaceSidebar from "./workspace-sidebar";

interface WorkspaceSidebarShellProps {
  projectId: string;
  children: React.ReactNode;
}

export default function WorkspaceSidebarShell({
  projectId,
  children,
}: WorkspaceSidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="hidden md:block">
        <WorkspaceSidebar
          projectId={projectId}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>

      <div
        data-collapsed={collapsed ? "true" : "false"}
        className={[
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          collapsed ? "md:pl-16" : "md:pl-60",
        ].join(" ")}
      >
        {children}
      </div>
    </>
  );
}
