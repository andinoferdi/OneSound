"use client";

import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const Header = ({ className, ...props }: React.ComponentProps<"header">) => {
  return (
    <header
      data-slot="header"
      data-header="header"
      className={cn(
        "flex h-16 w-full items-center justify-between border-b border-border bg-background px-6",
        className
      )}
      {...props}
    />
  );
};

const HeaderContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="header-content"
      data-header="content"
      className={cn("flex items-center gap-4", className)}
      {...props}
    />
  );
};

const HeaderTitle = ({ className, ...props }: React.ComponentProps<"h1">) => {
  return (
    <h1
      data-slot="header-title"
      data-header="title"
      className={cn(
        "text-[20px] leading-6 font-semibold tracking-[-0.02em] text-foreground",
        className
      )}
      {...props}
    />
  );
};

const HeaderActions = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="header-actions"
      data-header="actions"
      className={cn("flex items-center gap-6", className)}
      {...props}
    />
  );
};

const HeaderSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) => {
  return (
    <Separator
      data-slot="header-separator"
      data-header="separator"
      className={cn("bg-border", className)}
      {...props}
    />
  );
};

export { Header, HeaderActions, HeaderContent, HeaderSeparator, HeaderTitle };
