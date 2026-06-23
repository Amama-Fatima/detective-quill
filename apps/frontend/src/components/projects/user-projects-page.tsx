"use client";

import { useState } from "react";
import { Project } from "@detective-quill/shared-types";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import SidebarInvestigator from "./sidebar-investigator";
import ProjectsTabs from "./projects-tabs";
import ProjectsPageHeader from "./projects-page-header";
import BackgroundAccents from "../layout/background-accents";

interface UserProjectsPageProps {
  initialProjects: Project[];
  invitedProjects?: Project[];
}

export default function UserProjectsPage({
  initialProjects,
  invitedProjects = [],
}: UserProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([
    ...initialProjects,
    ...invitedProjects,
  ]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div
        className="
          pointer-events-none
          absolute bottom-0 left-0
          w-55 h-55 sm:w-70 sm:h-70 lg:w-85 lg:h-85
          rounded-full
          bg-gradient-to-br from-border/40 to-accent/85
          opacity-50
          border 
          translate-x-[-80px] -translate-y-[70px] lg:translate-x-[-80px] lg:-translate-y-[-200px]
        "
      />
      <BackgroundAccents />

      <ProjectsPageHeader onNewCase={() => setShowCreateDialog(true)} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          <SidebarInvestigator />
          <main className="relative flex-1 min-w-0 overflow-hidden">
            <ProjectsTabs
              projects={projects}
              invitedProjects={invitedProjects}
            />
          </main>
        </div>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        setProjects={setProjects}
      />
    </div>
  );
}
