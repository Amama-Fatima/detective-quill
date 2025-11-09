"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Plus,
  Filter,
  Grid3X3,
  List,
  BookOpen,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FolderOpen,
  Coffee,
  Skull,
  Target,
  FileText,
  Users,
  MapPin,
  Star,
  Archive,
  TrendingUp,
  Activity,
  Briefcase,
} from "lucide-react";
import {
  CreateProjectDto,
  ProjectResponse,
} from "@detective-quill/shared-types";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { useProjects } from "@/hooks/use-projects";
import ProjectsDisplay from "./project-display";

type SortOption = "updated" | "created" | "title" | "progress";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "list";
type FilterOption = "all" | "active" | "completed" | "archived";

interface ProjectsPageClientProps {
  user: User;
  initialProjects: ProjectResponse[];
}

// Generate deterministic mock data based on project ID to avoid hydration issues
function generateProjectEnhancement(projectId: string) {
  // Use project ID as seed for consistent "random" values
  const seed = projectId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const seededRandom = (min: number, max: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    const random = x - Math.floor(x);
    return Math.floor(random * (max - min + 1)) + min;
  };

  const genres = [
    "Cozy Mystery",
    "Hard-boiled",
    "Police Procedural",
    "Noir",
    "Thriller",
  ];
  const statuses = ["active", "completed", "archived"] as const;

  return {
    progress: seededRandom(10, 95),
    wordCount: seededRandom(5000, 55000),
    chapters: seededRandom(1, 20),
    genre: genres[seededRandom(0, genres.length - 1)],
    status: statuses[seededRandom(0, statuses.length - 1)],
    // Use project creation date instead of random date
    lastActivity: new Date(),
  };
}

export function ProjectsPageClient({
  user,
  initialProjects,
}: ProjectsPageClientProps) {
  const router = useRouter();
  const { projects, creating, createProject, updateProject, deleteProject } =
    useProjects(initialProjects);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [isClient, setIsClient] = useState(false);

  // Only run client-side to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enhanced projects with deterministic data
  const enhancedProjects = projects.map((project) => ({
    ...project,
    ...generateProjectEnhancement(project.id),
  }));

  // Calculate statistics
  const stats = {
    total: enhancedProjects.length,
    active: enhancedProjects.filter((p) => p.status === "active").length,
    completed: enhancedProjects.filter((p) => p.status === "completed").length,
    totalWords: enhancedProjects.reduce((sum, p) => sum + p.wordCount, 0),
    avgProgress:
      Math.round(
        enhancedProjects.reduce((sum, p) => sum + p.progress, 0) /
          enhancedProjects.length
      ) || 0,
  };

  // Filter and sort projects
  const filteredAndSortedProjects = enhancedProjects
    .filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false);

      if (filter === "all") return matchesSearch;
      return matchesSearch && project.status === filter;
    })
    .sort((a, b) => {
      let aValue: string | Date | number;
      let bValue: string | Date | number;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created":
          aValue = new Date(a.created_at ?? 0);
          bValue = new Date(b.created_at ?? 0);
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
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
    router.push(`/workspace/${projectId}`);
  };

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
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
                className="bg-primary hover:bg-primary/90 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Open New Case
              </Button>
            </div>

            {/* Loading Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-card/50 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1 animate-pulse">
                      --
                    </div>
                    <div className="text-xs text-muted-foreground case-file">
                      Loading...
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-lg"></div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Open New Case
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats.total}
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Total Cases
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-accent/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent mb-1">
                  {stats.active}
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Active
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-green-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats.completed}
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Solved
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-blue-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(stats.totalWords / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Total Words
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {stats.avgProgress}%
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Avg Progress
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as FilterOption)}
        >
          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <TabsList className="bg-card/50 border border-border">
              <TabsTrigger value="all" className="font-serif">
                All Cases
              </TabsTrigger>
              <TabsTrigger value="active" className="font-serif">
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="font-serif">
                Completed
              </TabsTrigger>
              <TabsTrigger value="archived" className="font-serif">
                Archived
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

              {/* Sort Controls */}
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-40 bg-card/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="title">Case Name</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-3 bg-card/50"
              >
                {sortOrder === "desc" ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex border border-border rounded-lg bg-card/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <TabsContent value="all">
            <ProjectsDisplay
              projects={filteredAndSortedProjects}
              viewMode={viewMode}
              onOpenProject={handleOpenProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
            />
          </TabsContent>
          <TabsContent value="active">
            <ProjectsDisplay
              projects={filteredAndSortedProjects}
              viewMode={viewMode}
              onOpenProject={handleOpenProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
            />
          </TabsContent>
          <TabsContent value="completed">
            <ProjectsDisplay
              projects={filteredAndSortedProjects}
              viewMode={viewMode}
              onOpenProject={handleOpenProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
            />
          </TabsContent>
          <TabsContent value="archived">
            <ProjectsDisplay
              projects={filteredAndSortedProjects}
              viewMode={viewMode}
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
