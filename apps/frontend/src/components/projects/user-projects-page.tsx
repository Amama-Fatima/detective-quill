"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Project } from "@detective-quill/shared-types";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import SidebarInvestigator from "./sidebar-investigator";
import ProjectsTabs from "./projects-tabs";
import { useProjectsListFilter } from "@/hooks/use-projects-list-filter";
import ProjectsPageHeader from "./projects-page-header";

type FilterOption = "all" | "active" | "completed" | "archived" | "invited";

interface UserProjectsPageProps {
  initialProjects: Project[];
  invitedProjects?: Project[];
}

export default function UserProjectsPage({
  initialProjects,
  invitedProjects = [],
}: UserProjectsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([...initialProjects, ...invitedProjects]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");

  const filtered = useProjectsListFilter(projects, invitedProjects, searchTerm);
  const totalCount = filtered.filteredProjects.length + filtered.filteredInvitedProjects.length;

  useEffect(() => {
    const tab = (searchParams.get("tab") as FilterOption) || "all";
    if (["all", "active", "completed", "archived", "invited"].includes(tab)) {
      setFilter(tab);
    }
  }, [searchParams]);

  const handleFilterChange = (tab: FilterOption) => {
    setFilter(tab);
    if (tab === "all") { router.replace(pathname); return; }
    if (tab !== searchParams.get("tab")) router.replace(`${pathname}?tab=${tab}`);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-size-[28px_28px]" />
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-32 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />

      <ProjectsPageHeader totalCount={totalCount} onNewCase={() => setShowCreateDialog(true)} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          <SidebarInvestigator />
          <main className="flex-1 min-w-0">
            <ProjectsTabs
              filter={filter}
              onFilterChange={handleFilterChange}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              {...filtered}
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