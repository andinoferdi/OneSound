import type { CurrentUserResponse } from "@/types/auth";

import {
  LayoutDashboard,
  Settings,
  Trophy,
  Users,
  GraduationCap,
  UserCog,
} from "lucide-react";

type MenuItem = {
  title: string;
  url?: string;
  icon?: React.ElementType;
  code?: string;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  {
    title: "Menu Utama",
    url: "divider",
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Prestasi",
    url: "/dashboard/achievements",
    icon: Trophy,
  },
  {
    title: "Manajemen User",
    url: "/dashboard/user",
    icon: Users,
    code: "user:manage",
  },
  {
    title: "Daftar Mahasiswa",
    url: "/dashboard/students",
    icon: GraduationCap,
    code: "user:manage",
  },
  {
    title: "Daftar Dosen Wali",
    url: "/dashboard/lecturers",
    icon: UserCog,
    code: "user:manage",
  },
  {
    title: "Pengaturan",
    url: "/dashboard/pengaturan",
    icon: Settings,
    code: "Setting",
  },
];

export const permissionUtils = {
  hasAccess: (
    userData: CurrentUserResponse | null,
    menuCode: string
  ): boolean => {
    if (!userData || !userData.permissions || !menuCode) {
      return false;
    }

    return userData.permissions.includes(menuCode);
  },

  filterMenuItemsByPermission: (
    userData: CurrentUserResponse | null
  ): MenuItem[] => {
    if (!userData) {
      return [];
    }

    return menuItems
      .map((item) => {
        if (item.url === "divider") {
          return item;
        }

        if (!item.code) {
          if (item.children && item.children.length > 0) {
            const filteredChildren = item.children.filter((child) => {
              if (!child.code) return true;
              return permissionUtils.hasAccess(userData, child.code);
            });

            return {
              ...item,
              children: filteredChildren,
            };
          }
          return item;
        }

        if (!permissionUtils.hasAccess(userData, item.code)) {
          return null;
        }

        if (item.children && item.children.length > 0) {
          const filteredChildren = item.children.filter((child) => {
            if (!child.code) return true;
            return permissionUtils.hasAccess(userData, child.code);
          });

          return {
            ...item,
            children: filteredChildren,
          };
        }

        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  },

  cleanupDividers: (items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.url === "divider") {
        const hasItemsAfter = items
          .slice(i + 1)
          .some((nextItem) => nextItem.url !== "divider");

        if (hasItemsAfter && result.length > 0) {
          result.push(item);
        }
      } else {
        result.push(item);
      }
    }

    return result;
  },

  getPermittedMenuItems: (userData: CurrentUserResponse | null): MenuItem[] => {
    const filteredItems = permissionUtils.filterMenuItemsByPermission(userData);
    return permissionUtils.cleanupDividers(filteredItems);
  },
};

export { menuItems };
export type { MenuItem };
