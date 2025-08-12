"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  ProjectResponse,
  CreateProjectDto,
} from "@detective-quill/shared-types";
import {
  createProject,
  getProjects,
  deleteProject,
  updateProject,
} from "@/lib/backend-calls/projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [newProject, setNewProject] = useState<CreateProjectDto>({
    title: "",
    description: "",
  });

  // Editing state
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
  }>({
    title: "",
    description: "",
  });

  // Fetch projects
  const fetchProjects = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await getProjects(session.access_token);

      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        toast.error(response.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    if (!newProject.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      setCreating(true);
      const response = await createProject(newProject, session.access_token);

      if (response.success && response.data) {
        toast.success("Project created successfully");
        setProjects((prev) => [response.data!, ...prev]);
        setNewProject({ title: "", description: "" });
        setShowCreateForm(false);
      } else {
        toast.error(response.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!session?.access_token) return;

    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await deleteProject(projectId, session.access_token);

      if (response.success) {
        toast.success("Project deleted successfully");
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        toast.error(response.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  // Update project
  const handleUpdateProject = async (projectId: string) => {
    if (!session?.access_token) return;

    if (!editForm.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      const response = await updateProject(
        projectId,
        { title: editForm.title, description: editForm.description },
        session.access_token
      );

      if (response.success && response.data) {
        toast.success("Project updated successfully");
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? response.data! : p))
        );
        setEditingProject(null);
      } else {
        toast.error(response.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  // Start editing
  const startEditing = (project: ProjectResponse) => {
    setEditingProject(project.id);
    setEditForm({
      title: project.title,
      description: project.description || "",
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProject(null);
    setEditForm({ title: "", description: "" });
  };

  // Open project (navigate to project detail page)
  const openProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // Effects
  useEffect(() => {
    if (!authLoading && session) {
      fetchProjects();
    }
  }, [session, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/auth/login");
    }
  }, [session, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="mt-2 text-gray-600">
            Manage your writing projects and stories
          </p>
        </div>

        {/* Create Project Section */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {showCreateForm ? "Create New Project" : "Add Project"}
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showCreateForm ? "Cancel" : "New Project"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your project (optional)"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-500 text-lg">
                No projects yet. Create your first project to get started!
              </div>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow p-6">
                {editingProject === project.id ? (
                  // Edit form
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full text-xl font-semibold px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Project description"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateProject(project.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-gray-600 mb-3">
                            {project.description}
                          </p>
                        )}
                        <div className="text-sm text-gray-500">
                          Created:{" "}
                          {project.created_at
                            ? new Date(project.created_at).toLocaleDateString()
                            : "Unknown"}
                          {project.updated_at !== project.created_at && (
                            <span className="ml-4">
                              Updated:{" "}
                              {project.updated_at
                                ? new Date(
                                    project.updated_at
                                  ).toLocaleDateString()
                                : "Unknown"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openProject(project.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => startEditing(project)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
