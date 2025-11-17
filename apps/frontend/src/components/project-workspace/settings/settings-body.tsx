"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { ProjectMember } from "@detective-quill/shared-types";
import { ProjectDetailsCard } from "./project-details-card";
import { DangerZoneCard } from "./danger-zone-card";
import { CaseInfoCard } from "./case-info-card";

interface Project {
  id: string;
  title: string;
  description: string | null;
  author_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
}

interface ProjectSettingsBodyProps {
  project: Project;
  initialMembers: ProjectMember[];
  currentUserId: string;
}

const ProjectSettingsBody = ({
  project,
  initialMembers,
  currentUserId,
}: ProjectSettingsBodyProps) => {
  const {
    members,
    addingMember,
    addMember,
    removeMember,
  } = useSettings(project.id, initialMembers);

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [projectDescription, setProjectDescription] = useState(
    project.description || ""
  );
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Check if current user is the project owner
  const isOwner = project.author_id === currentUserId;

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      return;
    }

    const success = await addMember({ email: newMemberEmail });

    if (success) {
      setIsAddMemberOpen(false);
      setNewMemberEmail("");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="mystery-title text-3xl">Case Settings</h1>
              <p className="text-muted-foreground noir-text">
                Manage your investigation team and case configuration
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          {/* <div className="lg:col-span-2 space-y-8">
            <ProjectDetailsCard
              project={project}
              isOwner={isOwner}
              isEditing={isEditingProject}
              setIsEditing={setIsEditingProject}
              projectTitle={projectTitle}
              setProjectTitle={setProjectTitle}
              projectDescription={projectDescription}
              setProjectDescription={setProjectDescription}
            />
          </div> */}

          {/* Sidebar */}
          <div className="space-y-6">


            <CaseInfoCard project={project} teamSize={members.length} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsBody;
