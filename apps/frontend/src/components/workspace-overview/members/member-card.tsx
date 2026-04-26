import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils/profile-utils";
import { ProjectMember } from "@detective-quill/shared-types";

interface MemberCardProps {
  member: ProjectMember;
  index: number;
  isOwner: boolean;
  userId: string;
  isActive: boolean;
  deleting: boolean;
  onRemove: (member: ProjectMember) => void;
}


export default function MemberCard({
  member,
  index,
  isOwner,
  userId,
  isActive,
  deleting,
  onRemove,
}: MemberCardProps) {
  const isAuthor = member.is_author;
  const canRemove = isOwner && member.user_id !== userId && !isAuthor;

  return (
    <div
      className={`
        relative flex flex-col gap-3 p-4 rounded-md
        border bg-card
        ${
          isAuthor
            ? "border-t-2 border-t-primary border-x-border border-b-border"
            : "border-border"
        }
        hover:bg-accent/20 transition-colors
      `}
    >
      <div
        aria-hidden
        className={`
          absolute -top-1.75 right-5 w-3 h-5
          border-2 rounded-t-full border-b-0
          ${isAuthor ? "border-primary" : "border-muted-foreground/35"}
        `}
      />

      <span className="case-file text-xs text-muted-foreground">
        Member #{String(index + 1).padStart(3, "0")}
      </span>

      <Avatar
        className={`
          h-12 w-12 rounded-none border
          ${isAuthor ? "border-primary/50" : "border-border/60"}
        `}
      >
        <AvatarImage
          src={member.avatar_url?.trim() || undefined}
          alt={member.full_name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="object-cover"
        />
        <AvatarFallback
          className={`
            rounded-none font-mono text-sm font-bold
            ${isAuthor ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
          `}
        >
          {getInitials(member.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight text-foreground font-sans">
          {member.full_name}
        </p>
        <p className="truncate case-file text-xs text-muted-foreground mt-0.5 normal-case tracking-normal">
          {member.email}
        </p>
      </div>

      <Badge variant={isAuthor ? "default" : "secondary"}>
        {isAuthor ? "Author" : "Beta Reader"}
      </Badge>

      <div className="mt-auto border-t border-border/40 pt-2 flex items-center justify-between">
        <span className="case-file text-xs text-muted-foreground/60">
          {isAuthor ? "Case Lead" : "Informant"}
        </span>
        {canRemove && (
          <button
            disabled={!isActive || deleting}
            onClick={() => onRemove(member)}
            aria-label={`Remove ${member.full_name}`}
            className="
              case-file text-xs
              text-muted-foreground border border-border/50
              px-2 py-0.5
              hover:border-destructive hover:text-destructive
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}