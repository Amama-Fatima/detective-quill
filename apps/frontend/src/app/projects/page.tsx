// src/app/projects/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  // AlphabeticalSort,
  Filter,
} from "lucide-react";
import { CreateProjectDto } from "@detective-quill/shared-types";
import { ProfileHeader } from "@/components/profile-section/profile-header";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

type SortOption = "updated" | "created" | "title";
type SortOrder = "asc" | "desc";

export default function ProjectsPage() {
  const { session, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const {
    projects,
    loading: projectsLoading,
    creating,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(
      (project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false)
    )
    .sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created":
          aValue = new Date(a.created_at ?? 0);
          bValue = new Date(b.created_at ?? 0);
          break;
        case "updated":
        default:
          aValue = new Date(a.updated_at ?? a.created_at ?? 0);
          bValue = new Date(b.updated_at ?? b.created_at ?? 0);
          break;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleCreateProject = async (data: CreateProjectDto) => {
    return await createProject(data);
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/auth/login");
    }
  }, [session, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen">
      <ProfileHeader
        user={user}
        projectCount={projects.length}
        onCreateProject={() => setShowCreateDialog(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <Tabs defaultValue="projects" className="w-full">
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                Projects
                <Badge variant="secondary" className="ml-1">
                  {projects.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="archived" disabled className="opacity-50">
                Archived
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 items-center gap-4 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value: SortOption) => setSortBy(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last updated
                      </div>
                    </SelectItem>
                    <SelectItem value="created">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Created
                      </div>
                    </SelectItem>
                    <SelectItem value="title">
                      <div className="flex items-center">
                        {/* <AlphabeticalSort className="h-4 w-4 mr-2" /> */}
                        Name
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="px-3"
                >
                  {sortOrder === "desc" ? (
                    <SortDesc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Projects Grid */}
            <ProjectsGrid
              projects={filteredAndSortedProjects}
              loading={projectsLoading}
              onOpenProject={handleOpenProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateProject}
        creating={creating}
      />
    </div>
  );
}
