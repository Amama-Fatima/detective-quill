"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@detective-quill/shared-types";
import ProjectsSearchInput from "./projects-search-input";
import ProjectsListTable from "./projects-list-table";
import { useEffect, useState } from "react";
import { useProjectsListFilter } from "@/hooks/use-projects-list-filter";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type FilterOption = "all" | "active" | "completed" | "archived" | "invited";

const TAB_OPTIONS: FilterOption[] = [
  "all",
  "active",
  "completed",
  "archived",
  "invited",
];

interface ProjectsTabsProps {
  projects: Project[];
  invitedProjects: Project[];
}

export default function ProjectsTabs({
  projects,
  invitedProjects,
}: ProjectsTabsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    activeProjects,
    completedProjects,
    archivedProjects,
    filteredInvitedProjects,
    filteredProjects,
  } = useProjectsListFilter(projects, invitedProjects, searchTerm);

  const [filter, setFilter] = useState<FilterOption>("all");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const tab = (searchParams.get("tab") as FilterOption) || "all";
    if (["all", "active", "completed", "archived", "invited"].includes(tab)) {
      setFilter(tab);
    }
  }, [searchParams]);

  const handleFilterChange = (tab: FilterOption) => {
    setFilter(tab);
    if (tab === "all") {
      router.replace(pathname);
      return;
    }
    if (tab !== searchParams.get("tab"))
      router.replace(`${pathname}?tab=${tab}`);
  };

  return (
    <Tabs
      value={filter}
      onValueChange={(value) => handleFilterChange(value as FilterOption)}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
        <TabsList className="bg-card border border-border h-auto p-0 gap-0 rounded-md overflow-hidden">
          {TAB_OPTIONS.map((tab, i, arr) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={`case-file text-[11px] tracking-widest uppercase px-4 py-2.5 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${i !== arr.length - 1 ? "border-r border-border/60" : ""} transition-colors duration-150`}
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <ProjectsSearchInput value={searchTerm} onChange={setSearchTerm} />
      </div>

      <TabsContent value="all">
        <ProjectsListTable projects={filteredProjects} />
      </TabsContent>
      <TabsContent value="active">
        <ProjectsListTable projects={activeProjects} />
      </TabsContent>
      <TabsContent value="completed">
        <ProjectsListTable projects={completedProjects} />
      </TabsContent>
      <TabsContent value="archived">
        <ProjectsListTable projects={archivedProjects} />
      </TabsContent>
      <TabsContent value="invited">
        <ProjectsListTable projects={filteredInvitedProjects} />
      </TabsContent>
    </Tabs>
  );
}
