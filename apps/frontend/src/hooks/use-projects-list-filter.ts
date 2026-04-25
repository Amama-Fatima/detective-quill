import { useMemo } from "react";
import { Project } from "@detective-quill/shared-types";

export function useProjectsListFilter(
  projects: Project[],
  invitedProjects: Project[],
  searchTerm: string,
) {
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
    () => filteredProjects.filter((p) => p.status === "active"),
    [filteredProjects],
  );

  const completedProjects = useMemo(
    () => filteredProjects.filter((p) => p.status === "completed"),
    [filteredProjects],
  );

  const archivedProjects = useMemo(
    () => filteredProjects.filter((p) => p.status === "archived"),
    [filteredProjects],
  );

  const filteredInvitedProjects = useMemo(
    () => invitedProjects.filter(matchesSearch),
    [invitedProjects, normalizedSearch],
  );

  return {
    filteredProjects,
    activeProjects,
    completedProjects,
    archivedProjects,
    filteredInvitedProjects,
  };
}