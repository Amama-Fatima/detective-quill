"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Users,
  UserPlus,
  Trash2,
  Crown,
  Edit3,
  AlertTriangle,
  Shield,
  Mail,
  Calendar,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { ProjectMember } from "@detective-quill/shared-types";
import { formatDate } from "@/lib/utils/utils";

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
    updating,
    addingMember,
    updateProject,
    addMember,
    removeMember,
    deleteProject,
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

  const getRoleIcon = (member: ProjectMember) => {
    if (member.user_id === project.author_id) {
      return <Crown className="h-4 w-4" />;
    }
    return <Edit3 className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (member: ProjectMember) => {
    if (member.user_id === project.author_id) {
      return "default"; // Creator
    }
    return "secondary"; // Member
  };

  const getRoleText = (member: ProjectMember) => {
    if (member.user_id === project.author_id) {
      return "Creator";
    }
    return "Member";
  };

  const handleSaveProject = async () => {
    const success = await updateProject({
      title: projectTitle,
      description: projectDescription,
    });

    if (success) {
      setIsEditingProject(false);
      // Update local state to reflect the changes immediately
      project.title = projectTitle;
      project.description = projectDescription;
    }
  };

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

  const handleDeleteProject = async () => {
    await deleteProject();
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
          <div className="lg:col-span-2 space-y-8">
            {/* Project Details */}
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 mr-3 text-primary" />
                    <div>
                      <h3 className="text-xl font-serif">Case Details</h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        Basic information about your investigation
                      </p>
                    </div>
                  </div>
                  {isOwner && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProject(!isEditingProject)}
                      disabled={updating}
                    >
                      {isEditingProject ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditingProject && isOwner ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Case Title</Label>
                      <Input
                        id="title"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="mt-1"
                        disabled={updating}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Case Description</Label>
                      <Textarea
                        id="description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="mt-1"
                        rows={4}
                        placeholder="Brief summary of your mystery..."
                        disabled={updating}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingProject(false)}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProject} disabled={updating}>
                        {updating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Title
                      </Label>
                      <p className="font-serif text-lg mt-1">{project.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Description
                      </Label>
                      <p className="noir-text mt-1">
                        {project.description || "No description provided"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Created
                        </Label>
                        <p className="mt-1">{formatDate(project.created_at)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Last Updated
                        </Label>
                        <p className="mt-1">{formatDate(project.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="shadow-lg border-accent/20">
              <CardHeader className="border-b border-accent/10 bg-gradient-to-r from-accent/5 to-transparent">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 mr-3 text-accent" />
                    <div>
                      <h3 className="text-xl font-serif">Investigation Team</h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        Manage team members and their access levels
                      </p>
                    </div>
                  </div>
                  {isOwner && (
                    <Dialog
                      open={isAddMemberOpen}
                      onOpenChange={setIsAddMemberOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={addingMember}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Detective
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-serif">
                            Add New Detective
                          </DialogTitle>
                          <DialogDescription>
                            Invite a new team member to join your investigation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newMemberEmail}
                              onChange={(e) =>
                                setNewMemberEmail(e.target.value)
                              }
                              placeholder="detective@mystery.com"
                              className="mt-1"
                              disabled={addingMember}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddMemberOpen(false)}
                            disabled={addingMember}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddMember}
                            disabled={addingMember}
                          >
                            {addingMember ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Invitation
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Detective</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.user_id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {member.profiles.avatar_url ? (
                                <img
                                  src={member.profiles.avatar_url}
                                  alt={member.profiles.full_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {member.profiles.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.profiles.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.profiles.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(member)}
                            className="case-file"
                          >
                            {getRoleIcon(member)}
                            <span className="ml-2">{getRoleText(member)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(member.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {isOwner && member.user_id !== project.author_id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove Detective
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove{" "}
                                    {member.profiles.full_name} from this
                                    investigation? They will lose access to all
                                    case files immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() =>
                                      handleRemoveMember(member.user_id)
                                    }
                                  >
                                    Remove Detective
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Danger Zone */}
          <div className="space-y-6">
            {isOwner && (
              <Card className="shadow-lg border-destructive/20">
                <CardHeader className="border-b border-destructive/10 bg-gradient-to-r from-destructive/5 to-transparent">
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-6 w-6 mr-3 text-destructive" />
                    <div>
                      <h3 className="text-xl font-serif text-destructive">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        Irreversible actions
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-destructive mb-2">
                        Close Investigation
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete this case and all associated
                        evidence. This action cannot be undone.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Case
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Investigation
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{project.title}" and
                              remove all associated data including:
                              <br />• All case files and evidence
                              <br />• Team member access
                              <br />• Version history
                              <br />• Investigation notes
                              <br />
                              <br />
                              <strong>This action cannot be undone.</strong>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={handleDeleteProject}
                            >
                              Delete Investigation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-serif">Case Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Case ID</span>
                    <span className="font-mono text-xs">{project.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Size</span>
                    <span>{members.length} detectives</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={project.is_active ? "default" : "secondary"}
                    >
                      {project.is_active ? "Active" : "Closed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsBody;
