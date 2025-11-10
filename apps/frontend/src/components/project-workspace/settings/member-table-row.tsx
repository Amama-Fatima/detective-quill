"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Crown, Edit3, Calendar, Trash2 } from "lucide-react";
import { ProjectMember } from "@detective-quill/shared-types";
import { formatDate } from "@/lib/utils/utils";

interface MemberTableRowProps {
  member: ProjectMember;
  isOwner: boolean;
  projectAuthorId: string | null;
  onRemoveMember: (memberId: string) => void;
}

export function MemberTableRow({
  member,
  isOwner,
  projectAuthorId,
  onRemoveMember,
}: MemberTableRowProps) {
  const isCreator = member.user_id === projectAuthorId;

  const getRoleIcon = () => {
    if (isCreator) {
      return <Crown className="h-4 w-4" />;
    }
    return <Edit3 className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = () => {
    if (isCreator) {
      return "default"; // Creator
    }
    return "secondary"; // Member
  };

  const getRoleText = () => {
    if (isCreator) {
      return "Creator";
    }
    return "Member";
  };

  return (
    <TableRow key={member.user_id}>
      <TableCell>
        <div className="noir-text flex items-center space-x-3">
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
            <p className="font-medium">{member.profiles.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {member.profiles.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getRoleBadgeVariant()} className="case-file">
          {getRoleIcon()}
          <span className="ml-2">{getRoleText()}</span>
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(member.created_at)}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {isOwner && !isCreator && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Detective</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {member.profiles.full_name}{" "}
                  from this investigation? They will lose access to all case
                  files immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onRemoveMember(member.user_id)}
                >
                  Remove Detective
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  );
}
