"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDisplayName, getInitials } from "@/lib/utils/profile-utils";

const UserProfile = () => {
  const { user } = useAuth();
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);

  return (
    <Card className="overflow-hidden border-border/70 shadow-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account details</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 text-center">
        <Avatar className="size-24 border border-border/60 shadow-sm">
          <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
          <AvatarFallback className="text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <p className="text-lg font-semibold leading-tight">{displayName}</p>
          <p className="text-sm text-muted-foreground break-all">
            {user?.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
