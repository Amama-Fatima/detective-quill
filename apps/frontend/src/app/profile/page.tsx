"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  Camera,
  Save,
  Edit,
  Award,
  Target,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Coffee,
  BookOpen,
  FileText,
  TrendingUp,
  Activity,
  Star,
  Shield,
  Zap,
  Eye,
  Clock,
  Fingerprint,
  Search,
  Skull,
  Crown,
  Flame,
  Trophy,
  Users,
  PenTool,
  Brain,
  Heart,
  Lock,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface DetectiveProfile {
  id: string;
  email: string;
  full_name: string;
  pen_name: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string;
  detective_rank: string;
  specialization: string;
  joined_date: string;
  writing_stats: {
    total_words: number;
    completed_stories: number;
    active_cases: number;
    writing_streak: number;
    favorite_genre: string;
    daily_target: number;
  };
  achievements: string[];
  case_files: {
    solved: number;
    cold_cases: number;
    active_investigations: number;
  };
  preferences: {
    theme: string;
    notifications: boolean;
    public_profile: boolean;
    show_stats: boolean;
  };
}

export default function DetectiveProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock profile data - in real app, fetch from Supabase
  const [profile, setProfile] = useState<DetectiveProfile>({
    id: user?.id || "",
    email: user?.email || "",
    full_name: user?.user_metadata?.full_name || "Detective Writer",
    pen_name: "A. Christie Detective",
    bio: "Crafting intricate mysteries where every clue matters and every character has secrets to hide.",
    location: "London, England",
    website: "https://mysterysolver.com",
    avatar_url: user?.user_metadata?.avatar_url || "",
    detective_rank: "Senior Detective",
    specialization: "Locked Room Mysteries",
    joined_date: user?.created_at || new Date().toISOString(),
    writing_stats: {
      total_words: 245670,
      completed_stories: 8,
      active_cases: 3,
      writing_streak: 15,
      favorite_genre: "Cozy Mystery",
      daily_target: 1500,
    },
    achievements: [
      "first_case",
      "word_warrior",
      "consistency_crown",
      "plot_twist_master",
      "character_creator",
      "deadline_detective",
    ],
    case_files: {
      solved: 8,
      cold_cases: 2,
      active_investigations: 3,
    },
    preferences: {
      theme: "dark",
      notifications: true,
      public_profile: true,
      show_stats: true,
    },
  });

  // Achievement definitions
  const achievementData = {
    first_case: {
      name: "First Case Closed",
      description: "Completed your first mystery story",
      icon: Target,
      color: "text-blue-600",
      rarity: "common",
    },
    word_warrior: {
      name: "Word Warrior",
      description: "Written over 100,000 words",
      icon: PenTool,
      color: "text-green-600",
      rarity: "uncommon",
    },
    consistency_crown: {
      name: "Consistency Crown",
      description: "Maintained a 30-day writing streak",
      icon: Crown,
      color: "text-purple-600",
      rarity: "rare",
    },
    plot_twist_master: {
      name: "Plot Twist Master",
      description: "Crafted 50 unexpected revelations",
      icon: Brain,
      color: "text-orange-600",
      rarity: "epic",
    },
    character_creator: {
      name: "Character Creator",
      description: "Developed 25 unique characters",
      icon: Users,
      color: "text-pink-600",
      rarity: "uncommon",
    },
    deadline_detective: {
      name: "Deadline Detective",
      description: "Never missed a writing deadline",
      icon: Clock,
      color: "text-red-600",
      rarity: "legendary",
    },
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800";
      case "uncommon":
        return "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20";
      case "rare":
        return "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20";
      case "epic":
        return "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20";
      case "legendary":
        return "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Here you would save to Supabase
      // await supabase.from('profiles').upsert(profile);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    toast.info("Avatar upload coming soon!");
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const memberSince = new Date(profile.joined_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
    }
  );

  const todaysProgress = Math.min(
    (1247 / profile.writing_stats.daily_target) * 100,
    100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container max-w-6xl mx-auto py-8 space-y-8">
        {/* Header Section */}
        <Card className="relative overflow-hidden border-primary/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/10"></div>
          <CardContent className="relative p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl group-hover:border-primary/40 transition-colors">
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-4xl font-serif font-bold">
                    {profile.full_name?.charAt(0) ||
                      profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleAvatarUpload}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="mystery-title text-4xl">
                      {profile.pen_name || profile.full_name}
                    </h1>
                    <Badge className="bg-primary/10 text-primary border-primary/30 case-file">
                      {profile.detective_rank}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {memberSince}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>

                  <p className="noir-text text-muted-foreground max-w-2xl">
                    {profile.bio}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-card/50 rounded-lg border border-primary/10">
                    <div className="text-2xl font-bold text-primary">
                      {profile.case_files.solved}
                    </div>
                    <div className="text-xs text-muted-foreground case-file">
                      Cases Solved
                    </div>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg border border-accent/10">
                    <div className="text-2xl font-bold text-accent">
                      {profile.writing_stats.writing_streak}
                    </div>
                    <div className="text-xs text-muted-foreground case-file">
                      Day Streak
                    </div>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg border border-green-500/10">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(profile.writing_stats.total_words / 1000)}K
                    </div>
                    <div className="text-xs text-muted-foreground case-file">
                      Words Written
                    </div>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg border border-blue-500/10">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.achievements.length}
                    </div>
                    <div className="text-xs text-muted-foreground case-file">
                      Badges Earned
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "secondary" : "outline"}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
                {profile.website && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-card/50">
            <TabsTrigger value="overview" className="font-serif">
              Case Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="font-serif">
              Detective Badges
            </TabsTrigger>
            <TabsTrigger value="stats" className="font-serif">
              Investigation Stats
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-serif">
              Case Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Today's Progress */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Today's Investigation Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Daily Writing Target</span>
                      <span className="font-mono">
                        1,247 /{" "}
                        {profile.writing_stats.daily_target.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={todaysProgress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span>
                        {profile.writing_stats.writing_streak} day streak
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>2h 34m active today</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detective Specialization */}
              <Card className="border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent" />
                    Detective Specialization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <div className="text-2xl font-serif font-bold text-accent mb-2">
                      {profile.specialization}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Primary Investigation Focus
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Favorite Genre</span>
                      <span className="font-medium">
                        {profile.writing_stats.favorite_genre}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detective Rank</span>
                      <span className="font-medium text-primary">
                        {profile.detective_rank}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Case Statistics */}
              <Card className="border-green-500/20 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Case File Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {profile.case_files.solved}
                      </div>
                      <div className="text-sm text-muted-foreground case-file">
                        Cases Solved
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        +2 this month
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent mb-2">
                        {profile.case_files.active_investigations}
                      </div>
                      <div className="text-sm text-muted-foreground case-file">
                        Active Cases
                      </div>
                      <div className="text-xs text-accent mt-1">
                        In progress
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {profile.case_files.cold_cases}
                      </div>
                      <div className="text-sm text-muted-foreground case-file">
                        Cold Cases
                      </div>
                      <div className="text-xs text-blue-600 mt-1">On hold</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Detective Badges Collection
                </CardTitle>
                <CardDescription>
                  Earn badges by completing writing milestones and solving cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {profile.achievements.map((achievementId) => {
                    const achievement =
                      achievementData[
                        achievementId as keyof typeof achievementData
                      ];
                    const Icon = achievement.icon;

                    return (
                      <div
                        key={achievementId}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${getRarityColor(
                          achievement.rarity
                        )}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg bg-white/50 ${achievement.color}`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-serif font-semibold">
                                {achievement.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-xs case-file"
                              >
                                {achievement.rarity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Locked Achievement Example */}
                  <div className="p-4 rounded-lg border-2 border-dashed border-muted opacity-50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif font-semibold text-muted-foreground">
                          Mystery Badge
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Complete 5 more cases to unlock
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Writing Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Words Written</span>
                      <span className="font-mono font-bold">
                        {profile.writing_stats.total_words.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stories Completed</span>
                      <span className="font-bold">
                        {profile.writing_stats.completed_stories}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Writing Streak</span>
                      <span className="font-bold text-orange-600">
                        {profile.writing_stats.writing_streak} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Daily Words</span>
                      <span className="font-mono">
                        {Math.round(
                          profile.writing_stats.total_words /
                            (profile.writing_stats.writing_streak || 1)
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Completed "Murder at Midnight" - 2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Started new case "The Missing Heir" - Yesterday</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Earned "Plot Twist Master" badge - 3 days ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Hit 15-day writing streak - 1 week ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Detective Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pen_name">
                        Pen Name / Detective Alias
                      </Label>
                      <Input
                        id="pen_name"
                        value={profile.pen_name}
                        onChange={(e) =>
                          setProfile({ ...profile, pen_name: e.target.value })
                        }
                        placeholder="Your detective persona"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Detective Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      placeholder="Describe your detective writing style and interests..."
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) =>
                          setProfile({ ...profile, location: e.target.value })
                        }
                        placeholder="City, Country"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profile.website}
                        onChange={(e) =>
                          setProfile({ ...profile, website: e.target.value })
                        }
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your detective profile preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">Public Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow other detectives to view your profile
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">Writing Statistics</h3>
                      <p className="text-sm text-muted-foreground">
                        Show your writing progress publicly
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">Account Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage password and security settings
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
