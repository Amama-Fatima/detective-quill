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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Users,
  UserPlus,
  Trash2,
  Crown,
  Edit3,
  Eye,
  AlertTriangle,
  Shield,
  Mail,
  Calendar,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";

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
}

interface ProjectMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: "creator" | "writer" | "reviewer";
  joined_date: string;
  status: "active" | "pending" | "inactive";
  avatar_url?: string;
}

const ProjectSettingsBody = ({ project }: ProjectSettingsBodyProps) => {
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [projectDescription, setProjectDescription] = useState(
    project.description || ""
  );
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"writer" | "reviewer">(
    "writer"
  );

  // Hardcoded members data for now
  const projectMembers: ProjectMember[] = [
    {
      id: "1",
      user_id: "user-1",
      email: "detective.holmes@mystery.com",
      full_name: "Sherlock Holmes",
      role: "creator",
      joined_date: "2024-01-15",
      status: "active",
      avatar_url: "/avatars/holmes.jpg",
    },
    {
      id: "2",
      user_id: "user-2",
      email: "dr.watson@mystery.com",
      full_name: "Dr. John Watson",
      role: "writer",
      joined_date: "2024-01-20",
      status: "active",
      avatar_url: "/avatars/watson.jpg",
    },
    {
      id: "3",
      user_id: "user-3",
      email: "inspector.lestrade@mystery.com",
      full_name: "Inspector Lestrade",
      role: "reviewer",
      joined_date: "2024-02-01",
      status: "pending",
      avatar_url: "/avatars/lestrade.jpg",
    },
    {
      id: "4",
      user_id: "user-4",
      email: "mrs.hudson@mystery.com",
      full_name: "Mrs. Hudson",
      role: "reviewer",
      joined_date: "2024-02-10",
      status: "active",
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "creator":
        return <Crown className="h-4 w-4" />;
      case "writer":
        return <Edit3 className="h-4 w-4" />;
      case "reviewer":
        return <Eye className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "creator":
        return "default";
      case "writer":
        return "secondary";
      case "reviewer":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleSaveProject = () => {
    // TODO: Implement save functionality
    console.log("Saving project:", {
      title: projectTitle,
      description: projectDescription,
    });
    setIsEditingProject(false);
  };

  const handleAddMember = () => {
    // TODO: Implement add member functionality
    console.log("Adding member:", {
      email: newMemberEmail,
      role: newMemberRole,
    });
    setIsAddMemberOpen(false);
    setNewMemberEmail("");
    setNewMemberRole("writer");
  };

  const handleRemoveMember = (memberId: string) => {
    // TODO: Implement remove member functionality
    console.log("Removing member:", memberId);
  };

  const handleDeleteProject = () => {
    // TODO: Implement delete project functionality
    console.log("Deleting project:", project.id);
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProject(!isEditingProject)}
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
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditingProject ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Case Title</Label>
                      <Input
                        id="title"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="mt-1"
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
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingProject(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProject}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
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
                        <p className="mt-1">
                          {new Date(
                            project.created_at || ""
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Last Updated
                        </Label>
                        <p className="mt-1">
                          {new Date(
                            project.updated_at || ""
                          ).toLocaleDateString()}
                        </p>
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
                  <Dialog
                    open={isAddMemberOpen}
                    onOpenChange={setIsAddMemberOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
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
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="detective@mystery.com"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={newMemberRole}
                            onValueChange={(value: "writer" | "reviewer") =>
                              setNewMemberRole(value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="writer">Writer</SelectItem>
                              <SelectItem value="reviewer">Reviewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddMemberOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddMember}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invitation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Detective</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {member.avatar_url ? (
                                <img
                                  src={member.avatar_url}
                                  alt={member.full_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {member.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{member.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(member.role)}
                            className="case-file"
                          >
                            {getRoleIcon(member.role)}
                            <span className="ml-2 capitalize">
                              {member.role}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(member.joined_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {member.role !== "creator" && (
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
                                    {member.full_name} from this investigation?
                                    They will lose access to all case files
                                    immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() =>
                                      handleRemoveMember(member.id)
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
                      Permanently delete this case and all associated evidence.
                      This action cannot be undone.
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
                    <span>{projectMembers.length} detectives</span>
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
                    <span>
                      {new Date(project.created_at || "").toLocaleDateString()}
                    </span>
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
