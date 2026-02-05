"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Briefcase } from "lucide-react";
import { Project } from "@detective-quill/shared-types";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import ProjectsDisplay from "./projects-display";

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

  const activeProjects = projects.filter(
    (project) => project.status === "active",
  );
  const completedProjects = projects.filter(
    (project) => project.status === "completed",
  );
  const archivedProjects = projects.filter(
    (project) => project.status === "archived",
  );

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [isClient, setIsClient] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Header Section */}
      <div className="border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <Briefcase className="h-8 w-8 text-primary" />
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
              className="bg-primary hover:bg-primary/90 shadow-lg cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-2" />
              Open New Case
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={filter}
          onValueChange={(value) => {
            setFilter(value as FilterOption);
            updateTabUrl(value as FilterOption);
          }}
        >
          {/* Controls Section */}
          <div className="noir-text flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <TabsList className="bg-card/50 border border-border">
              <TabsTrigger value="all" className="font-serif cursor-pointer">
                All Cases
              </TabsTrigger>
              <TabsTrigger value="active" className="font-serif cursor-pointer">
                Active
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="font-serif cursor-pointer"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="font-serif cursor-pointer"
              >
                Archived
              </TabsTrigger>
              <TabsTrigger
                value="invited"
                className="font-serif cursor-pointer"
              >
                Invited
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search case files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-card/50"
                />
              </div>
            </div>
          </div>
          {/* todo: add proper filteration for these, just filter on client side based on status, can do this inside the useProjects hook as well */}
          <TabsContent value="all">
            <ProjectsDisplay projects={projects} />
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
            <ProjectsDisplay projects={invitedProjects} />
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
