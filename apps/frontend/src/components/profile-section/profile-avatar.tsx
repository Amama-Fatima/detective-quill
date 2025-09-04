import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";

interface ProfileAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-32 w-32",
};

export function ProfileAvatar({ user, size = "xl" }: ProfileAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user.user_metadata?.full_name || user.email || "User";
  const avatarUrl = user.user_metadata?.avatar_url;
  console.log("user in profile avataar", user);
  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl} alt={displayName} />
      <AvatarFallback className="text-sm font-medium">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}
