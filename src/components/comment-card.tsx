"use client";

import { cn } from "@/lib/utils";
import { type Comment } from "@/types/contact";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { IconPinned } from "@tabler/icons-react";

interface CommentCardProps {
  comment: Comment;
}

const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ];

  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const CommentCard = ({ comment }: CommentCardProps) => {
  const avatarColor = getAvatarColor(comment.user_name);
  const initials = getInitials(comment.user_name);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: id,
      });
    } catch {
      return "Baru saja";
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer",
        comment.is_pinned
          ? "bg-primary/5 border-2 border-primary/30 shadow-sm hover:bg-primary/10 hover:border-primary/40"
          : "bg-background/90 border border-border/60 hover:bg-muted hover:border-border hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0",
          avatarColor
        )}
      >
        {comment.profile_image ? (
          <Image
            src={comment.profile_image}
            alt={comment.user_name}
            width={40}
            height={40}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-foreground text-sm">
            {comment.user_name}
          </h4>
          {comment.is_pinned && (
            <IconPinned className="h-3.5 w-3.5 text-primary" stroke={2} />
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
};
