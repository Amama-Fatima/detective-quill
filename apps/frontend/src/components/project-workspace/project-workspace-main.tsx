"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  Skull,
  Coffee,
  Fingerprint,
  Timer,
  Star,
  Activity,
  ChevronRight,
  Play,
  Edit,
  Plus,
  Archive,
  AlertCircle,
  Lightbulb,
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
  // Enhanced mock data for demonstration
  const caseFiles = [
    {
      id: 1,
      type: "Character",
      severity: "critical",
      title: "Detective Sarah's Eye Color Inconsistency",
      description: "Brown eyes in Chapter 2, blue eyes in Chapter 7",
      chapter: "Chapter 7",
      status: "active",
      priority: "high",
      timeFound: "2 hours ago",
    },
    {
      id: 2,
      type: "Timeline",
      severity: "urgent",
      title: "Murder Timeline Contradiction",
      description: "Murder occurred Tuesday vs. witness says Wednesday",
      chapter: "Chapter 4",
      status: "investigating",
      priority: "critical",
      timeFound: "4 hours ago",
    },
    {
      id: 3,
      type: "Location",
      severity: "minor",
      title: "Coffee Shop Location Error",
      description: "Described as 'downtown' then 'uptown'",
      chapter: "Chapter 6",
      status: "solved",
      priority: "low",
      timeFound: "1 day ago",
    },
  ];

  const recentVersions = [
    {
      id: "v2.1.4",
      codename: "The Butler's Alibi",
      message: "Major breakthrough: Revealed killer's true identity and motive",
      timestamp: "2 hours ago",
      changes: 156,
      type: "major",
      author: "You",
      status: "current",
    },
    {
      id: "v2.1.3",
      codename: "Red Herring Revision",
      message: "Added misleading clues about the gardener's involvement",
      timestamp: "6 hours ago",
      changes: 43,
      type: "minor",
      author: "You",
      status: "archived",
    },
    {
      id: "v2.1.2",
      codename: "Timeline Overhaul",
      message: "Restructured murder sequence and witness testimonies",
      timestamp: "1 day ago",
      changes: 89,
      type: "major",
      author: "You",
      status: "archived",
    },
  ];

  const mysteryMetrics = {
    totalWords: 67420,
    chapters: 15,
    characters: 12,
    locations: 18,
    clues: 34,
    redHerrings: 9,
    suspects: 6,
    plotHoles: 2,
    completionRate: 78,
    consistencyScore: 85,
  };

  const writingProgress = {
    dailyTarget: 1500,
    todayWritten: 1247,
    weeklyGoal: 10500,
    weekWritten: 8340,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Case Overview */}
        <div className="mb-8 relative overflow-hidden">
          <Card className="border-primary/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/10"></div>
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                    <Fingerprint className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold mb-2">
                      Case Status: Active Investigation
                    </h2>
                    <p className="text-muted-foreground">
                      Last evidence logged 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {mysteryMetrics.consistencyScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Story Consistency
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-card/50 border border-primary/10">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {mysteryMetrics.suspects}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Suspects
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card/50 border border-accent/20">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {mysteryMetrics.clues}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Clues Planted
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card/50 border border-primary/10">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {mysteryMetrics.redHerrings}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Red Herrings
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card/50 border border-destructive/20">
                  <div className="text-2xl font-bold text-destructive mb-1">
                    {mysteryMetrics.plotHoles}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Plot Holes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Cases - Inconsistency Detection */}
            <Card className="border-destructive/20 shadow-lg">
              <CardHeader className="border-b border-destructive/10 bg-gradient-to-r from-destructive/5 to-transparent">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-6 w-6 mr-3 text-destructive" />
                    <div>
                      <h3 className="text-xl font-serif">Active Case Files</h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        Story inconsistencies requiring investigation
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="case-file">
                    {caseFiles.filter((f) => f.status !== "solved").length} Open
                    Cases
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {caseFiles.map((caseFile) => (
                    <div
                      key={caseFile.id}
                      className={`p-6 transition-all duration-200 hover:bg-accent/5 cursor-pointer border-l-4 ${
                        caseFile.severity === "critical"
                          ? "border-destructive bg-destructive/5"
                          : caseFile.severity === "urgent"
                          ? "border-orange-500 bg-orange-500/5"
                          : "border-green-500 bg-green-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <Badge
                              variant={
                                caseFile.status === "solved"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="mr-3 case-file"
                            >
                              {caseFile.type}
                            </Badge>
                            <Badge variant="outline" className="mr-2 text-xs">
                              {caseFile.chapter}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {caseFile.timeFound}
                            </span>
                          </div>

                          <h4 className="font-serif font-semibold mb-2 text-lg">
                            {caseFile.title}
                          </h4>
                          <p className="text-muted-foreground mb-3 noir-text">
                            {caseFile.description}
                          </p>

                          <div className="flex items-center">
                            {caseFile.status === "solved" ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm text-green-600 font-medium">
                                  Case Closed
                                </span>
                              </>
                            ) : (
                              <>
                                <Skull className="h-4 w-4 text-destructive mr-2" />
                                <span className="text-sm text-destructive font-medium">
                                  {caseFile.status === "investigating"
                                    ? "Under Investigation"
                                    : "Awaiting Detective"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          {caseFile.status !== "solved" && (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Search className="h-4 w-4 mr-2" />
                              Investigate
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-border bg-muted/20">
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Run Complete Story Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Locker - Version Control */}
            <Card className="shadow-lg border-accent/20">
              <CardHeader className="border-b border-accent/10 bg-gradient-to-r from-accent/5 to-transparent">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Archive className="h-6 w-6 mr-3 text-accent" />
                    <div>
                      <h3 className="text-xl font-serif">Evidence Locker</h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        Story version history and major revisions
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="case-file">
                    {recentVersions.length} Versions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentVersions.map((version, index) => (
                    <div
                      key={version.id}
                      className="p-6 hover:bg-accent/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Badge
                              variant={index === 0 ? "default" : "outline"}
                              className="mr-3 case-file bg-accent text-accent-foreground"
                            >
                              {version.id}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="mr-2 text-xs font-serif"
                            >
                              {version.codename}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {version.timestamp}
                            </span>
                          </div>

                          <h4 className="font-serif font-semibold mb-2">
                            {version.message}
                          </h4>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="mr-4">
                              {version.changes} changes
                            </span>
                            <Users className="h-4 w-4 mr-1" />
                            <span>by {version.author}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {index === 0 && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Current
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Examine
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-border bg-muted/20">
                  <Button variant="outline" className="w-full">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Create New Case Version
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Writing Progress */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-serif">Today's Investigation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Daily Word Target</span>
                    <span className="font-mono">
                      {writingProgress.todayWritten}/
                      {writingProgress.dailyTarget}
                    </span>
                  </div>
                  <Progress
                    value={
                      (writingProgress.todayWritten /
                        writingProgress.dailyTarget) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weekly Progress</span>
                    <span className="font-mono">
                      {writingProgress.weekWritten}/{writingProgress.weeklyGoal}
                    </span>
                  </div>
                  <Progress
                    value={
                      (writingProgress.weekWritten /
                        writingProgress.weeklyGoal) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <Button size="sm" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Continue Writing
                </Button>
              </CardContent>
            </Card>

            {/* Investigation Tools */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-accent" />
                  <span className="font-serif">Investigation Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Suspect
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Plant Evidence
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Create Crime Scene
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline Builder
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Coffee className="h-4 w-4 mr-2" />
                  Interrogation Notes
                </Button>
              </CardContent>
            </Card>

            {/* Case Elements Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-serif">Case Elements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    Characters
                  </span>
                  <Badge variant="secondary">{mysteryMetrics.characters}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    Crime Scenes
                  </span>
                  <Badge variant="secondary">{mysteryMetrics.locations}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center text-sm">
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    Evidence Pieces
                  </span>
                  <Badge variant="secondary">{mysteryMetrics.clues}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center text-sm">
                    <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                    False Leads
                  </span>
                  <Badge variant="secondary">
                    {mysteryMetrics.redHerrings}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-accent" />
                  <span className="font-serif">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New suspect profile added
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Timeline evidence updated
                    </p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Chapter 8 investigation notes
                    </p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
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

export default WorkspaceMainBody;
