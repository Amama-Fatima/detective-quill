import React from "react";
import Breadcrumbs from "./bread-crumbs";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface TextEditorHeaderBarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  projectName: string;
  nodeId?: string;
  currentNodePath?: string;
}

// todo: everytime the toggle is changed, and the side bar is opened again, the file tree is refetched, we should try to avoid this

export default function TextEditorHeaderBar({
  sidebarOpen,
  onSidebarToggle,
  projectName,
  currentNodePath,
}: TextEditorHeaderBarProps) {
  return (
    <div className="bg-sidebar mx-3 mb-2 mt-3 flex items-center justify-between rounded-2xl border border-border/70 px-3 py-2 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          onClick={onSidebarToggle}
          size="icon"
          className="h-9 w-9 rounded-lg transition-colors hover:bg-muted cursor-pointer"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>

        {/* <div className="min-w-0 truncate">
          <Breadcrumbs projectName={projectName} />
          {currentNodePath ? (
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {currentNodePath}
            </div>
          ) : null}
        </div> */}
      </div>
    </div>
  );
}
