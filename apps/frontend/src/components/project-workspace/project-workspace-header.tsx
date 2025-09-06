import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Map,
  BarChart3,
  Settings,
  Bookmark,
  Clock,
  Star,
  Share,
  MoreVertical,
  Fingerprint,
  Coffee,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  title: string;
  description: string | null;
  author_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
}

interface WorkspaceHeaderProps {
  project: Project;
}

const ProjectWorkspaceHeader = ({ project }: WorkspaceHeaderProps) => {
  const navItems = [
    {
      id: "main",
      label: "Case Overview",
      href: `/workspace/${project.id}`,
      icon: Fingerprint,
      description: "Investigation dashboard",
    },
    {
      id: "blueprint",
      label: "Case Blueprint",
      href: `/workspace/${project.id}/blueprint`,
      icon: Map,
      description: "Story structure & planning",
    },
    {
      id: "text-editor",
      label: "Crime Scene",
      href: `/workspace/${project.id}/text-editor`,
      icon: FileText,
      description: "Writing & editing",
    },
    {
      id: "visualization",
      label: "Evidence Board",
      href: `/workspace/${project.id}/visualization`,
      icon: BarChart3,
      description: "Visual story analysis",
    },
  ];

  // Get current path to determine active tab
  const getCurrentTab = () => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.includes("/blueprint")) return "blueprint";
      if (path.includes("/text-editor")) return "text-editor";
      if (path.includes("/visualization")) return "visualization";
      return "main";
    }
    return "main";
  };

  const activeTab = getCurrentTab();

  return (
    <div className="border-b border-border bg-gradient-to-r from-background via-card to-background shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Project Title Section */}
        <div className="py-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Coffee className="h-8 w-8 text-primary" />
              </div>

              <div className="flex-1">
                <h1 className="mystery-title text-3xl mb-2">{project.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Last updated{" "}
                      {new Date(project.updated_at || "").toLocaleDateString()}
                    </span>
                  </div>
                  <Badge
                    variant={project.is_active ? "default" : "secondary"}
                    className="case-file"
                  >
                    {project.is_active ? "Active Investigation" : "Cold Case"}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-muted-foreground mt-2 noir-text max-w-2xl">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share Case
              </Button>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Favorite
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link
                      href={`/workspace/${project.id}/settings`}
                      className="flex items-center w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Project Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Export Case Files
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Close Investigation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="py-4">
          <nav className="flex space-x-1" role="tablist">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    group relative px-6 py-3 rounded-lg transition-all duration-200
                    hover:bg-accent/50 hover:shadow-md
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                  role="tab"
                  aria-selected={isActive}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-5 w-5 transition-transform duration-200 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <div className="text-left">
                      <div
                        className={`font-serif font-semibold ${
                          isActive ? "text-primary-foreground" : ""
                        }`}
                      >
                        {item.label}
                      </div>
                      <div
                        className={`text-xs transition-opacity duration-200 ${
                          isActive
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground/70 group-hover:opacity-100"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary-foreground rounded-t-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspaceHeader;
