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
  const displayName = getDisplayName(user!);
  const initials = getInitials(displayName);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <p className="text-base font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

    </section>
  );
};

export default UserProfile;
