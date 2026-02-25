import {  User } from "@supabase/supabase-js";

export const getDisplayName = (user: User) => {
  console.log("User object in getDisplayName:", user);
  const meta = user?.user_metadata;
  if (meta?.full_name) return meta.full_name;
  if (meta?.name) return meta.name;
  if (user?.email) return user.email.split("@")[0];
  return "Writer";
};

export const getInitials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "W";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};
