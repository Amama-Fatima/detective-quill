import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@detective-quill/shared-types";
import ProjectsSearchInput from "./projects-search-input";
import ProjectsListTable from "./projects-list-table";

type FilterOption = "all" | "active" | "completed" | "archived" | "invited";

const TAB_OPTIONS: FilterOption[] = ["all", "active", "completed", "archived", "invited"];

interface ProjectsTabsProps {
  filter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredProjects: Project[];
  activeProjects: Project[];
  completedProjects: Project[];
  archivedProjects: Project[];
  filteredInvitedProjects: Project[];
}

export default function ProjectsTabs({
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  filteredProjects,
  activeProjects,
  completedProjects,
  archivedProjects,
  filteredInvitedProjects,
}: ProjectsTabsProps) {
  return (
    <Tabs value={filter} onValueChange={(v) => onFilterChange(v as FilterOption)}>
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
        <ProjectsSearchInput value={searchTerm} onChange={onSearchChange} />
      </div>

      <TabsContent value="all"><ProjectsListTable projects={filteredProjects} /></TabsContent>
      <TabsContent value="active"><ProjectsListTable projects={activeProjects} /></TabsContent>
      <TabsContent value="completed"><ProjectsListTable projects={completedProjects} /></TabsContent>
      <TabsContent value="archived"><ProjectsListTable projects={archivedProjects} /></TabsContent>
      <TabsContent value="invited"><ProjectsListTable projects={filteredInvitedProjects} /></TabsContent>
    </Tabs>
  );
}