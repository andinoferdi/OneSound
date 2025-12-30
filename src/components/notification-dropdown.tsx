"use client";

import { memo, useEffect, useMemo, useState, useCallback } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Bell, Clock, X, AlertCircle } from "lucide-react";

import type { Notification } from "@/types/notification";
import {
  useNotifications,
  useNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/services/notification";
import { toast } from "react-toastify";

const getKindLabel = (type: string) => {
  if (type === "achievement_rejected") return "PRESTASI";
  return "LAINNYA";
};

const getTitle = (n: Notification) => {
  return n.title;
};

const getMessage = (n: Notification) => {
  return n.message;
};

const NotificationDropdown = memo(function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [page] = useState(1);
  const limit = 10;

  const { data: notificationsData, isLoading } = useNotifications(page, limit);
  const { data: unreadCountData } = useNotificationCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = notificationsData?.data ?? [];
  const notifCount = unreadCountData?.data?.count ?? 0;
  const hasUnread = notifCount > 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await markAsReadMutation.mutateAsync(id);
      } catch (error) {
        const errorMessage =
          (
            error as {
              response?: {
                data?: { data?: { message?: string }; message?: string };
              };
            }
          )?.response?.data?.data?.message ||
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Gagal menandai notifikasi sebagai sudah dibaca.";
        toast.error(errorMessage);
      }
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success("Semua notifikasi berhasil ditandai sebagai sudah dibaca.");
    } catch (error) {
      const errorMessage =
        (
          error as {
            response?: {
              data?: { data?: { message?: string }; message?: string };
            };
          }
        )?.response?.data?.data?.message ||
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Gagal menandai semua notifikasi sebagai sudah dibaca.";
      toast.error(errorMessage);
    }
  }, [markAllAsReadMutation]);

  const formatRelative = (iso: string) => {
    const date = new Date(iso);
    const diffMs = currentTime - date.getTime();
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);
    if (day > 0) return `${day} hari yang lalu`;
    if (hour > 0) return `${hour} jam yang lalu`;
    if (min > 0) return `${min} menit yang lalu`;
    return "baru saja";
  };

  const renderIcon = (n: Notification) => {
    const base = "w-12 h-12 rounded-xl flex items-center justify-center";
    if (n.type === "achievement_rejected") {
      return (
        <div className={`${base} bg-destructive/20`}>
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
      );
    }
    return (
      <div className={`${base} bg-muted`}>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  };

  const headerRight = useMemo(
    () => (
      <Button
        variant="ghost"
        className="h-auto p-0 font-normal text-warning hover:bg-warning-light hover:text-warning-text"
        disabled={!hasUnread || markAllAsReadMutation.isPending}
        onClick={handleMarkAllAsRead}
      >
        Tandai Semua Dibaca
      </Button>
    ),
    [hasUnread, markAllAsReadMutation.isPending, handleMarkAllAsRead]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Buka notifikasi"
          className="relative inline-flex h-6 w-6 items-center justify-center"
        >
          <Bell className="h-6 w-6 cursor-pointer text-muted-foreground" />
          {notifCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-white text-[11px] leading-3 font-bold">
              {notifCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Notifikasi</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Tutup"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Memuat...
            </div>
          ) : notifications?.length ? (
            notifications.map((n: Notification) => {
              const kind = getKindLabel(n.type);
              const isUnread = !n.is_read;
              const text = getMessage(n);
              const notificationContent = n.mongo_achievement_id ? (
                <Link
                  href={`/dashboard/achievements/${n.mongo_achievement_id}`}
                  onClick={() => {
                    if (isUnread) {
                      handleMarkAsRead(n.id);
                    }
                    setOpen(false);
                  }}
                  className="block"
                >
                  <div className="flex items-start gap-3">
                    {renderIcon(n)}
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-sm text-foreground">
                        <span className="font-medium">{getTitle(n)}</span>{" "}
                        {text}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="bg-info-light text-info-text hover:bg-info-light"
                        >
                          {kind}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatRelative(n.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {isUnread && (
                      <div className="shrink-0">
                        <div className="h-2 w-2 rounded-full bg-destructive"></div>
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => {
                    if (isUnread) {
                      handleMarkAsRead(n.id);
                    }
                  }}
                >
                  {renderIcon(n)}
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-medium">{getTitle(n)}</span> {text}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="secondary"
                        className="bg-info-light text-info-text hover:bg-info-light"
                      >
                        {kind}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelative(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {isUnread && (
                    <div className="shrink-0">
                      <div className="h-2 w-2 rounded-full bg-destructive"></div>
                    </div>
                  )}
                </div>
              );

              return (
                <div
                  key={n.id}
                  className="border-b p-4 last:border-b-0 hover:bg-muted"
                >
                  {notificationContent}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-muted p-4">
          {hasUnread && headerRight}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default NotificationDropdown;
