"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authService, useCurrentUser } from "@/services/auth";
import { useAuth } from "@/contexts/auth-context";

import { useTitleContext } from "../providers/title-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Header,
  HeaderActions,
  HeaderContent,
  HeaderTitle,
} from "../ui/header";
import NotificationDropdown from "@/components/notification-dropdown";
import { ChevronDown, LogOut, User } from "lucide-react";

export function DashboardHeader() {
  const { title } = useTitleContext();
  const { data: currentUser } = useCurrentUser();
  const { user: contextUser, logout } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    window.location.href = "/";
  };

  const userData = currentUser || contextUser;
  const userRole = userData?.role || "User";

  return (
    <Header>
      <HeaderContent>
        <SidebarTrigger className="h-6 w-6 text-muted-foreground hover:text-foreground" />
        <HeaderTitle>{title}</HeaderTitle>
      </HeaderContent>

      <HeaderActions>
        <NotificationDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback className="bg-muted text-[14px] leading-5 font-semibold tracking-[-0.01em] text-muted-foreground">
                {userData?.full_name
                  ? userData.full_name.charAt(0).toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col lg:flex">
              <span className="text-[14px] leading-5 font-semibold tracking-[-0.01em] text-foreground">
                {userData?.full_name || "User"}
              </span>
              <span className="text-left text-[12px] leading-4 font-normal tracking-[-0.01em] text-muted-foreground">
                {userRole}
              </span>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">
                  {userData?.full_name || "User"}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  {userData?.email || "user@example.com"}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  {userRole}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </HeaderActions>
    </Header>
  );
}
