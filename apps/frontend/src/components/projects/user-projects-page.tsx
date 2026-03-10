"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Project } from "@detective-quill/shared-types";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import ProjectsDisplay from "./projects-display";
import { BriefcaseIcon } from "../icons/brief-case-icon";
import ProjectsSearchInput from "./projects-search-input";

type FilterOption = "all" | "active" | "completed" | "archived" | "invited";

interface ProjectsPageClientProps {
  initialProjects: Project[];
  invitedProjects?: Project[];
}

export default function UserProjectsPage({
  initialProjects,
  invitedProjects = [],
}: ProjectsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([
    ...initialProjects,
    ...invitedProjects,
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [isClient, setIsClient] = useState(false);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchesSearch = (project: Project) => {
    if (!normalizedSearch) return true;

    const title = project.title?.toLowerCase() ?? "";
    const description = project.description?.toLowerCase() ?? "";

    return (
      title.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      project.status.toLowerCase().includes(normalizedSearch)
    );
  };

  const filteredProjects = useMemo(
    () => projects.filter(matchesSearch),
    [projects, normalizedSearch],
  );

  const activeProjects = useMemo(
    () => filteredProjects.filter((project) => project.status === "active"),
    [filteredProjects],
  );

  const completedProjects = useMemo(
    () => filteredProjects.filter((project) => project.status === "completed"),
    [filteredProjects],
  );

  const archivedProjects = useMemo(
    () => filteredProjects.filter((project) => project.status === "archived"),
    [filteredProjects],
  );

  const filteredInvitedProjects = useMemo(
    () => invitedProjects.filter(matchesSearch),
    [invitedProjects, normalizedSearch],
  );

  // Only run client-side to avoid hydration issues todo: is this necessary?
  useEffect(() => {
    setIsClient(true);
    const initialFilter = (searchParams.get("tab") as FilterOption) || "all";
    if (
      initialFilter &&
      ["all", "active", "completed", "archived", "invited"].includes(
        initialFilter,
      )
    ) {
      setFilter(initialFilter);
    }
  }, [searchParams]);

  const updateTabUrl = (tab: FilterOption) => {
    if (tab == "all") {
      router.replace(pathname);
      return;
    }
    if (tab == searchParams.get("tab")) return;
    const url = `${pathname}?tab=${tab}`;
    router.replace(url);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,oklch(24%_0.022_245)_1px,transparent_1px),linear-gradient(to_bottom,oklch(24%_0.022_245)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="border-b border-border bg-muted/90 backdrop-blur-sm">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-3">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <BriefcaseIcon />
              </div>
              <div>
                <h1 className="mystery-title text-4xl mb-2">
                  Detective's Case Files
                </h1>
                <p className="text-muted-foreground noir-text">
                  Manage your ongoing investigations and completed cases
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="bg-primary shadow-lg cursor-pointer font-playfair-display text-[1rem] hover:-translate-y-0.5 duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Open New Case
            </Button>
          </div>
        </div>
      </div>

      <div className="z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={filter}
          onValueChange={(value) => {
            setFilter(value as FilterOption);
            updateTabUrl(value as FilterOption);
          }}
        >
          <div className="noir-text flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <TabsList className="bg-card/50 border border-border">
              <TabsTrigger value="all" className="case-file cursor-pointer">
                All Cases
              </TabsTrigger>
              <TabsTrigger value="active" className="case-file cursor-pointer">
                Active
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="case-file cursor-pointer"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="case-file cursor-pointer"
              >
                Archived
              </TabsTrigger>
              <TabsTrigger value="invited" className="case-file cursor-pointer">
                Invited
              </TabsTrigger>
            </TabsList>

            <ProjectsSearchInput value={searchTerm} onChange={setSearchTerm} />
          </div>
          {/* todo: add proper filteration for these, just filter on client side based on status, can do this inside the useProjects hook as well */}
          <TabsContent value="all">
            <ProjectsDisplay projects={filteredProjects} />
          </TabsContent>
          <TabsContent value="active">
            <ProjectsDisplay projects={activeProjects} />
          </TabsContent>
          <TabsContent value="completed">
            <ProjectsDisplay projects={completedProjects} />
          </TabsContent>
          <TabsContent value="archived">
            <ProjectsDisplay projects={archivedProjects} />
          </TabsContent>
          <TabsContent value="invited">
            <ProjectsDisplay projects={filteredInvitedProjects} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        setProjects={setProjects}
      />
    </div>
  );
}
