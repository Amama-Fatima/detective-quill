"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  GitBranch,
  Users,
  MapPin,
  Calendar,
  BookOpen,
  Target,
  Zap,
  TrendingUp,
  FileText,
  Search,
  Shield,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  author_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
}

interface WorkspaceMainBodyProps {
  project: Project;
}

const WorkspaceMainBody = ({ project }: WorkspaceMainBodyProps) => {
  // Mock data for demonstration
  const inconsistencies = [
    {
      id: 1,
      type: "Character",
      severity: "high",
      description:
        "Detective Sarah mentioned having brown eyes in Chapter 2, but blue eyes in Chapter 7",
      chapter: "Chapter 7",
      status: "unresolved",
    },
    {
      id: 2,
      type: "Timeline",
      severity: "medium",
      description:
        "Murder occurred on Tuesday but witness statement says Wednesday",
      chapter: "Chapter 4",
      status: "unresolved",
    },
    {
      id: 3,
      type: "Location",
      severity: "low",
      description:
        "Coffee shop described as 'downtown' but later mentioned as 'uptown'",
      chapter: "Chapter 6",
      status: "resolved",
    },
  ];

  const versions = [
    {
      id: "v1.2.3",
      message: "Added new suspect backstory and refined murder weapon details",
      timestamp: "2 hours ago",
      changes: 23,
      author: "You",
    },
    {
      id: "v1.2.2",
      message: "Fixed timeline inconsistencies in Chapters 4-6",
      timestamp: "1 day ago",
      changes: 15,
      author: "You",
    },
    {
      id: "v1.2.1",
      message: "Major revision: Changed killer's motive and added red herrings",
      timestamp: "3 days ago",
      changes: 87,
      author: "You",
    },
  ];

  const storyStats = {
    totalWords: 45230,
    chapters: 12,
    characters: 8,
    locations: 15,
    clues: 23,
    redHerrings: 7,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Words</p>
                <p className="text-3xl font-bold text-blue-900">
                  {storyStats.totalWords.toLocaleString()}
                </p>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Chapters</p>
                <p className="text-3xl font-bold text-green-900">
                  {storyStats.chapters}
                </p>
              </div>
              <BookOpen className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Characters
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {storyStats.characters}
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Clues</p>
                <p className="text-3xl font-bold text-orange-900">
                  {storyStats.clues}
                </p>
              </div>
              <Search className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inconsistency Detection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Story Inconsistency Detection
                </div>
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-800"
                >
                  2 Active Issues
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inconsistencies.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      issue.severity === "high"
                        ? "border-red-500 bg-red-50"
                        : issue.severity === "medium"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-400 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Badge
                            variant={
                              issue.status === "resolved"
                                ? "secondary"
                                : "destructive"
                            }
                            className="mr-2"
                          >
                            {issue.type}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {issue.chapter}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center">
                          {issue.status === "resolved" ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <AlertTriangle
                              className={`h-4 w-4 mr-1 ${
                                issue.severity === "high"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            />
                          )}
                          <span
                            className={`text-xs ${
                              issue.status === "resolved"
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {issue.status === "resolved"
                              ? "Resolved"
                              : "Needs attention"}
                          </span>
                        </div>
                      </div>
                      {issue.status === "unresolved" && (
                        <Button variant="outline" size="sm">
                          Fix
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Run Full Consistency Check
              </Button>
            </CardContent>
          </Card>

          {/* Version Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="h-5 w-5 mr-2 text-indigo-600" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Badge
                          variant="outline"
                          className="mr-2 font-mono text-xs"
                        >
                          {version.id}
                        </Badge>
                        <span className="text-sm">{version.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium">{version.message}</p>
                      <div className="flex items-center text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {version.changes} changes • by {version.author}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Current
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <GitBranch className="h-4 w-4 mr-2" />
                Create New Version
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Add New Clue
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Create Character
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Add Location
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline Editor
              </Button>
            </CardContent>
          </Card>

          {/* Story Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Story Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Locations</span>
                <Badge variant="secondary">{storyStats.locations}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Red Herrings</span>
                <Badge variant="secondary">{storyStats.redHerrings}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Plot Threads</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Suspects</span>
                <Badge variant="secondary">5</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Writing Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Chapter 8 updated</p>
                <p>2 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Character profile added</p>
                <p>5 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Timeline revised</p>
                <p>1 day ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMainBody;
