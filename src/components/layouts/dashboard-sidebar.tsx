"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/services/auth";
import { useAuth } from "@/contexts/auth-context";
import { type MenuItem, permissionUtils } from "@/stores/menu-item";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";

// Dropdown generic
const SidebarMenuDropdown = React.memo(function SidebarMenuDropdown({
  icon,
  title,
  items,
}: {
  icon?: React.ElementType;
  title: string;
  items: MenuItem[];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { state, toggleSidebar } = useSidebar();

  const isChildActive = React.useMemo(
    () => items.some((it) => it.url && pathname.startsWith(it.url)),
    [items, pathname]
  );

  React.useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  const IconComponent = icon as React.ComponentType<{ className?: string }>;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // kalau sidebar collapsed, expand dulu biar dropdown kebuka enak
    if (state === "collapsed") {
      toggleSidebar();
      setIsOpen(true);
      return;
    }

    setIsOpen((v) => !v);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={title}
        isActive={isChildActive}
        onClick={handleToggle}
        className={cn("justify-between")}
      >
        <div className="flex items-center gap-2">
          {icon && <IconComponent className="h-4 w-4" />}
          <span className="truncate">{title}</span>
        </div>
        <span className="shrink-0">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </SidebarMenuButton>

      {state === "expanded" && isOpen ? (
        <SidebarMenuSub>
          {items.map((child) => {
            if (!child.url) return null;
            const ChildIconComponent = child.icon as React.ComponentType<{
              className?: string;
            }>;
            const childActive = pathname.startsWith(child.url);

            return (
              <SidebarMenuSubItem key={`${child.title}-${child.url}`}>
                <SidebarMenuSubButton asChild isActive={childActive}>
                  <Link href={child.url} className="flex items-center gap-2">
                    {child.icon && (
                      <ChildIconComponent className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{child.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
});

// Dynamic Property Dropdown (tetap kamu pakai nanti kalau datanya sudah ada)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _DynamicPropertyDropdown = React.memo(function DynamicPropertyDropdown({
  icon,
  title,
}: {
  icon?: React.ElementType;
  title: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { state, toggleSidebar } = useSidebar();

  const projects: Array<{ id: string; name: string }> = [];
  const isLoading = false;

  const isActive = pathname.startsWith("/properti/");

  React.useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const IconComponent = icon as React.ComponentType<{ className?: string }>;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (state === "collapsed") {
      toggleSidebar();
      setIsOpen(true);
      return;
    }

    setIsOpen((v) => !v);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={title}
        isActive={isActive}
        onClick={handleToggle}
        className="justify-between"
      >
        <div className="flex items-center gap-2">
          {icon && <IconComponent className="h-4 w-4" />}
          <span className="truncate">{title}</span>
        </div>
        <span className="shrink-0">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </SidebarMenuButton>

      {state === "expanded" && isOpen ? (
        <SidebarMenuSub>
          {isLoading ? (
            <SidebarMenuSubItem>
              <div className="px-3 py-2 text-xs text-sidebar-foreground/60">
                Loading...
              </div>
            </SidebarMenuSubItem>
          ) : projects.length ? (
            projects.map((p) => {
              const active = pathname === `/properti/${p.id}`;
              return (
                <SidebarMenuSubItem key={p.id}>
                  <SidebarMenuSubButton asChild isActive={active}>
                    <Link
                      href={`/properti/${p.id}`}
                      className="flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })
          ) : (
            <SidebarMenuSubItem>
              <div className="px-3 py-2 text-xs text-sidebar-foreground/60">
                No projects found
              </div>
            </SidebarMenuSubItem>
          )}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
});

// Single menu item
const SidebarMenuItemComponent = React.memo(function SidebarMenuItemComponent({
  item,
}: {
  item: MenuItem;
}) {
  const pathname = usePathname();

  if (!item.url) return null;

  if (item.children?.length) {
    return (
      <SidebarMenuDropdown
        icon={item.icon}
        title={item.title}
        items={item.children}
      />
    );
  }

  const IconComponent = item.icon as React.ComponentType<{
    className?: string;
  }>;
  const isActive =
    item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        isActive={isActive}
        className="justify-start"
      >
        <Link href={item.url} className="flex w-full items-center gap-2">
          {item.icon && <IconComponent className="h-4 w-4" />}
          <span className="truncate">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

export const AppSidebar = React.memo(function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { state } = useSidebar();
  const { data: currentUser } = useCurrentUser();
  const { user: contextUser } = useAuth();

  const userData = React.useMemo(
    () => currentUser || contextUser,
    [currentUser, contextUser]
  );

  const permittedMenuItems = React.useMemo(
    () => permissionUtils.getPermittedMenuItems(userData),
    [userData]
  );

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader
        className={cn(
          "flex items-center justify-center",
          isCollapsed ? "py-5" : "py-6"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}
        >
          {isCollapsed ? (
            <Image
              src="/images/logo.png"
              alt="logo"
              width={28}
              height={28}
              className="h-7 w-auto"
              priority
            />
          ) : (
            <>
              <Image
                src="/images/logo.png"
                alt="logo"
                width={36}
                height={36}
                className="h-9 w-auto"
                priority
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-sidebar-foreground">
                  SPPM
                </span>
                <span className="text-xs text-sidebar-foreground/60">
                  Pelaporan Prestasi
                </span>
              </div>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {permittedMenuItems.map((item, idx) => {
                  if (item.url === "divider") {
                    return (
                      <SidebarGroupLabel
                        key={`divider-${idx}-${item.title}`}
                        className={cn(
                          "mt-4",
                          "text-[10px] font-semibold tracking-widest uppercase"
                        )}
                      >
                        {item.title}
                      </SidebarGroupLabel>
                    );
                  }

                  // kalau kamu mau replace salah satu menu jadi dynamic dropdown:
                  // if (item.url === '/properti') return <DynamicPropertyDropdown key="dyn-prop" icon={item.icon} title={item.title} />;

                  return (
                    <SidebarMenuItemComponent
                      key={`menu-${item.title}-${item.url}`}
                      item={item}
                    />
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className={cn(isCollapsed ? "px-2 py-3" : "px-4 py-5")}>
        {isCollapsed ? (
          <div className="flex flex-col items-center text-[9px] font-semibold leading-tight text-sidebar-foreground/60">
            <span>SPPM</span>
            <span className="mt-0.5">© 2024</span>
          </div>
        ) : (
          <div className="text-center text-xs font-medium text-sidebar-foreground/60">
            Sistem Pelaporan Prestasi Mahasiswa
            <br />© 2024 All Rights Reserved
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = "AppSidebar";
