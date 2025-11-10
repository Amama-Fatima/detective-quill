import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { ProfileAvatar } from "./profile-avatar";

interface ProfileHeaderProps {
  user: User;
  projectCount: number;
  onCreateProject: () => void;
}

export function ProfileHeader({
  user,
  projectCount,
  onCreateProject,
}: ProfileHeaderProps) {
  const displayName = user.user_metadata?.full_name || "User";
  const username =
    user.user_metadata?.user_name || user.email?.split("@")[0] || "user";

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <ProfileAvatar user={user} size="xl" />

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="mystery-title text-2xl font-bold truncate">
                    {displayName}
                  </h1>
                  <p className="noir-text text-xl">@{username}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={onCreateProject} size="sm">
                    <Plus className="h-4 w-4 mr-2 cursor-pointer" />
                    New Project
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2 cursor-pointer" />
                    Settings
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="noir-text flex items-center text-[1rem">
                  <span className="font-medium">
                    {projectCount}
                  </span>
                  <span className="ml-1">projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
