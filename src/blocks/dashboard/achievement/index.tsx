"use client";

import React, { memo, useMemo, useState, useRef, useEffect } from "react";

import {
  AchievementForm,
  type AchievementFormValues,
} from "@/blocks/dashboard/achievement/form";
import { PageTitle } from "@/components/layouts/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PaginateTable,
  type PaginateTableRef,
} from "@/components/paginate-table";

import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/services/auth";

import {
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  submitAchievement,
  uploadAchievementAttachment,
  verifyAchievement,
  rejectAchievement,
} from "@/services/achievement";
import type {
  Achievement,
  AchievementStatus,
  AchievementListItem,
  AchievementType,
  CompetitionLevel,
  PublicationType,
  CreateAchievementBody,
  UpdateAchievementBody,
} from "@/types/achievement";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useInvalidateMutation } from "@/hooks/use-invalidate-mutation";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  Send,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ErrorWithMessage {
  message?: string;
  response?: {
    data?: {
      data?: {
        message?: string;
      };
      message?: string;
    };
  };
  data?: {
    message?: string;
  };
}

const getErrorMessage = (err: unknown) => {
  const error = err as ErrorWithMessage;
  return (
    error?.response?.data?.data?.message ||
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

const getStatusBadge = (status: AchievementStatus) => {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant: "secondary" | "default" | "destructive";
      className?: string;
    }
  > = {
    draft: { label: "Draft", variant: "secondary" },
    submitted: { label: "Terkirim", variant: "default" },
    verified: {
      label: "Terverifikasi",
      variant: "default",
      className: "bg-green-600 text-white border-green-600 hover:bg-green-700",
    },
    rejected: { label: "Ditolak", variant: "destructive" },
    deleted: { label: "Dihapus", variant: "destructive" },
  };

  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const getTypeLabel = (type: string) => {
  const typeLabels: Record<string, string> = {
    academic: "Akademik",
    competition: "Kompetisi",
    organization: "Organisasi",
    publication: "Publikasi",
    certification: "Sertifikasi",
    other: "Lainnya",
  };
  return typeLabels[type] || type;
};

const convertDateToRFC3339 = (
  dateStr: string | null | undefined
): string | undefined => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

interface ActionCellProps {
  row: AchievementListItem;
  isMahasiswa: boolean;
  isDosenWali?: boolean;
}

const ActionCell = memo(function ActionCell({
  row,
  isMahasiswa,
  isDosenWali = false,
}: ActionCellProps) {
  const queryClient = useQueryClient();

  const [openForm, setOpenForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const achievementId = selectedId ?? row.id;

  const achievementByIdQuery = useQuery({
    queryKey: ["achievements", achievementId],
    queryFn: () => getAchievementById(achievementId),
    enabled: openForm && Boolean(achievementId),
  });

  const achievement = (
    openForm ? achievementByIdQuery.data ?? row : row
  ) as Achievement;

  const achievementsPaginatedKey = ["achievements", "paginated"] as const;

  const refetchAchievementsTable = async () => {
    await queryClient.refetchQueries({
      queryKey: achievementsPaginatedKey,
      exact: true,
      type: "active",
    });
  };

  const updateMutation = useInvalidateMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAchievementBody }) =>
      updateAchievement(id, data),
    invalidates: [["achievements"]],
    onSuccess: async () => {
      await refetchAchievementsTable();
    },
  });

  const deleteMutation = useInvalidateMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    invalidates: [["achievements"]],
    onSuccess: async (_data, id) => {
      queryClient.setQueryData(["achievements", id], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return { ...(old as Record<string, unknown>), status: "deleted" };
      });
      await refetchAchievementsTable();
    },
  });

  const submitMutation = useInvalidateMutation({
    mutationFn: (id: string) => submitAchievement(id),
    invalidates: [["achievements"]],
    onSuccess: async (_data, id) => {
      queryClient.setQueryData(["achievements", id], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return { ...(old as Record<string, unknown>), status: "submitted" };
      });
      await refetchAchievementsTable();
    },
  });

  const uploadMutation = useInvalidateMutation({
    mutationFn: ({
      achievementId,
      file,
    }: {
      achievementId: string;
      file: File;
    }) => uploadAchievementAttachment(achievementId, file),
    invalidates: [["achievements"]],
  });

  const verifyMutation = useInvalidateMutation({
    mutationFn: (id: string) => verifyAchievement(id),
    invalidates: [["achievements"]],
    onSuccess: async (_data, id) => {
      queryClient.setQueryData(["achievements", id], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return { ...(old as Record<string, unknown>), status: "verified" };
      });
      await refetchAchievementsTable();
      toast.success("Prestasi berhasil diverifikasi");
    },
  });

  const rejectMutation = useInvalidateMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      rejectAchievement(id, note),
    invalidates: [["achievements"]],
    onSuccess: async (_data, { id }) => {
      queryClient.setQueryData(["achievements", id], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return { ...(old as Record<string, unknown>), status: "rejected" };
      });
      await refetchAchievementsTable();
      toast.success("Prestasi berhasil ditolak");
      setOpenReject(false);
      setRejectionNote("");
    },
  });

  const rowStatus = (row.status ?? "draft") as AchievementStatus;
  const canEdit = isMahasiswa && rowStatus === "draft";
  const canDelete = isMahasiswa && rowStatus === "draft";
  const canSubmit = isMahasiswa && rowStatus === "draft";
  const canVerify = isDosenWali && rowStatus === "submitted";
  const canReject = isDosenWali && rowStatus === "submitted";

  const handleEdit = () => {
    setSelectedId(row.id);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
    setPendingFiles([]);
  };

  const handleFormSubmit = async (values: AchievementFormValues) => {
    if (!selectedId) return;

    try {
      const data: UpdateAchievementBody = {
        achievementType: values.achievementType,
        title: values.title,
        description: values.description,
        points: values.points,
        tags: values.tags,
        details: {
          ...values.details,
          eventDate: convertDateToRFC3339(values.details.eventDate),
          validUntil: convertDateToRFC3339(values.details.validUntil),
          period: (() => {
            const start = convertDateToRFC3339(values.details.period?.start);
            const end = convertDateToRFC3339(values.details.period?.end);
            if (start && end) {
              return { start, end };
            }
            return undefined;
          })(),
        },
        attachments: values.attachments ?? [],
      };
      await updateMutation.mutateAsync({ id: selectedId, data });
      toast.success("Prestasi berhasil diupdate");

      if (pendingFiles.length > 0) {
        try {
          const uploaded = await Promise.all(
            pendingFiles.map((file) =>
              uploadMutation.mutateAsync({
                achievementId: selectedId,
                file,
              })
            )
          );

          const existing = values.attachments ?? [];
          const merged = [...existing, ...uploaded];

          await updateMutation.mutateAsync({
            id: selectedId,
            data: { attachments: merged },
          });

          setPendingFiles([]);
        } catch (e) {
          toast.error(`Gagal upload file: ${getErrorMessage(e)}`);
        }
      }

      handleCloseForm();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(row.id);
      toast.success("Prestasi berhasil di-submit");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(row.id);
      toast.success("Prestasi berhasil dihapus");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setOpenDelete(false);
    }
  };

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync(row.id);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleReject = async () => {
    if (!rejectionNote.trim()) {
      toast.error("Catatan penolakan wajib diisi");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        id: row.id,
        note: rejectionNote.trim(),
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={
              updateMutation.isPending ||
              deleteMutation.isPending ||
              submitMutation.isPending ||
              verifyMutation.isPending ||
              rejectMutation.isPending
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/achievements/${row.id}`}
              className="flex cursor-pointer items-center"
              aria-label="Lihat detail prestasi"
            >
              <Eye className="mr-2 h-4 w-4" />
              Detail
            </Link>
          </DropdownMenuItem>

          {canEdit && (
            <DropdownMenuItem
              onClick={handleEdit}
              disabled={updateMutation.isPending}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Ubah
            </DropdownMenuItem>
          )}

          {canSubmit && (
            <DropdownMenuItem
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Kirim
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem
              onClick={() => setOpenDelete(true)}
              disabled={deleteMutation.isPending}
              variant="destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          )}

          {canVerify && (
            <DropdownMenuItem
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Verifikasi
            </DropdownMenuItem>
          )}

          {canReject && (
            <DropdownMenuItem
              onClick={() => setOpenReject(true)}
              disabled={rejectMutation.isPending}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Tolak
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ubah Prestasi</DialogTitle>
            <DialogDescription>
              Ubah data prestasi di form berikut.
            </DialogDescription>
          </DialogHeader>

          <AchievementForm
            mode="edit"
            initialValues={{
              achievementType: achievement.achievementType as AchievementType,
              title: achievement.title,
              description: achievement.description,
              points: achievement.points,
              tags: achievement.tags ?? [],
              attachments: achievement.attachments ?? [],
              details: {
                ...achievement.details,
                competitionLevel: achievement.details.competitionLevel as
                  | CompetitionLevel
                  | null
                  | undefined,
                publicationType: achievement.details.publicationType as
                  | PublicationType
                  | null
                  | undefined,
                customFields: achievement.details.customFields ?? undefined,
                period: achievement.details.period
                  ? {
                      start: achievement.details.period.start || null,
                      end: achievement.details.period.end || null,
                    }
                  : null,
              },
            }}
            onSubmit={handleFormSubmit}
            submitting={updateMutation.isPending}
            onPendingFilesChange={setPendingFiles}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus prestasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Prestasi hanya bisa dihapus saat status masih draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openReject} onOpenChange={setOpenReject}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak prestasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Berikan catatan penolakan untuk prestasi ini. Catatan ini akan
              dikirim ke mahasiswa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 space-y-2">
            <Label htmlFor="rejection-note">Catatan Penolakan</Label>
            <Textarea
              id="rejection-note"
              placeholder="Masukkan alasan penolakan..."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionNote.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejectMutation.isPending ? "Menolak..." : "Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

const AchievementPage = () => {
  const queryClient = useQueryClient();
  const tableRef = useRef<PaginateTableRef>(null);
  const pathname = usePathname();

  const { data: currentUser } = useCurrentUser();
  const { user: contextUser } = useAuth();
  const userData = currentUser || contextUser;

  interface UserData {
    role?: string;
    roleName?: string;
  }

  const userRole = String(
    (userData as UserData)?.role || (userData as UserData)?.roleName || ""
  ).toLowerCase();
  const isMahasiswa = userRole === "mahasiswa";
  const isDosenWali = userRole === "dosen wali" || userRole === "dosenwali";

  const [openCreate, setOpenCreate] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const achievementsPaginatedKey = ["achievements", "paginated"] as const;

  const refetchAchievementsTable = async () => {
    await queryClient.refetchQueries({
      queryKey: achievementsPaginatedKey,
      exact: true,
      type: "active",
    });
  };

  useEffect(() => {
    if (pathname === "/achievements") {
      void queryClient.refetchQueries({
        queryKey: ["achievements", "paginated"],
        exact: true,
        type: "active",
      });
    }
  }, [pathname, queryClient]);

  const createMutation = useInvalidateMutation({
    mutationFn: (data: CreateAchievementBody) => createAchievement(data),
    invalidates: [["achievements"]],
    onSuccess: async () => {
      await refetchAchievementsTable();
    },
  });

  const uploadMutation = useInvalidateMutation({
    mutationFn: ({
      achievementId,
      file,
    }: {
      achievementId: string;
      file: File;
    }) => uploadAchievementAttachment(achievementId, file),
    invalidates: [["achievements"]],
  });

  const columns = useMemo<ColumnDef<AchievementListItem>[]>(() => {
    const baseColumns: ColumnDef<AchievementListItem>[] = [
      {
        accessorKey: "id",
        header: "ID",
        meta: { style: { width: "110px" } },
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            #{row.original.id.slice(-8)}
          </span>
        ),
      },
      {
        accessorKey: "achievementType",
        header: "Tipe",
        meta: { style: { minWidth: "120px" } },
        cell: ({ row }) => (
          <span className="text-sm">
            {getTypeLabel(row.original.achievementType)}
          </span>
        ),
      },
    ];

    if (!isMahasiswa) {
      baseColumns.push({
        accessorKey: "student_name",
        header: "Pengirim",
        meta: { style: { minWidth: "180px" } },
        cell: ({ row }) => (
          <span className="text-sm">{row.original.student_name || "-"}</span>
        ),
      });
    }

    baseColumns.push(
      {
        accessorKey: "title",
        header: "Judul",
        meta: { style: { minWidth: "320px" } },
        cell: ({ row }) => (
          <div className="max-w-[360px]">
            <span className="line-clamp-2 text-sm font-medium">
              {row.original.title}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "points",
        header: "Poin",
        meta: { style: { width: "90px" } },
        cell: ({ row }) => (
          <span className="font-medium">{row.original.points}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { style: { width: "130px" } },
        cell: ({ row }) =>
          getStatusBadge((row.original.status ?? "draft") as AchievementStatus),
      },
      {
        id: "actions",
        header: "Aksi",
        enableHiding: false,
        meta: { style: { width: "110px" }, align: "right" },
        cell: ({ row }) => (
          <ActionCell
            row={row.original}
            isMahasiswa={isMahasiswa}
            isDosenWali={isDosenWali}
          />
        ),
      }
    );

    return baseColumns;
  }, [isMahasiswa, isDosenWali]);

  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => {
    setOpenCreate(false);
    setPendingFiles([]);
  };

  const handleCreateSubmit = async (values: AchievementFormValues) => {
    try {
      const data: CreateAchievementBody = {
        achievementType: values.achievementType,
        title: values.title,
        description: values.description,
        points: values.points,
        tags: values.tags,
        details: {
          ...values.details,
          eventDate: convertDateToRFC3339(values.details.eventDate),
          validUntil: convertDateToRFC3339(values.details.validUntil),
          period: (() => {
            const start = convertDateToRFC3339(values.details.period?.start);
            const end = convertDateToRFC3339(values.details.period?.end);
            if (start && end) {
              return { start, end };
            }
            return undefined;
          })(),
        },
      };
      const created = await createMutation.mutateAsync(data);
      toast.success("Prestasi berhasil dibuat");

      if (
        pendingFiles.length > 0 &&
        created &&
        typeof created === "object" &&
        "id" in created
      ) {
        const achievementId = String(created.id);
        try {
          const uploaded = await Promise.all(
            pendingFiles.map((file) =>
              uploadMutation.mutateAsync({
                achievementId,
                file,
              })
            )
          );

          const merged = [...(created.attachments ?? []), ...uploaded];

          await updateAchievement(achievementId, { attachments: merged });

          queryClient.invalidateQueries({ queryKey: ["achievements"] });
          await refetchAchievementsTable();

          setPendingFiles([]);
        } catch (e) {
          toast.error(`Gagal upload file: ${getErrorMessage(e)}`);
        }
      }

      handleCloseCreate();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const isCreating = createMutation.isPending;

  return (
    <section className="p-4">
      <PageTitle title="Prestasi Mahasiswa" />

      <div className="mt-4">
        <PaginateTable
          ref={tableRef}
          id="achievements-table"
          url="/achievements"
          columns={
            columns as ColumnDef<
              Record<string, unknown> & { id?: string | number }
            >[]
          }
          perPage={10}
          queryKey={["achievements", "paginated"]}
          Plugin={
            isMahasiswa ? (
              <Button
                onClick={handleOpenCreate}
                disabled={isCreating}
                className="text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Prestasi
              </Button>
            ) : undefined
          }
        />
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Prestasi</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk menambah prestasi baru.
            </DialogDescription>
          </DialogHeader>

          <AchievementForm
            mode="create"
            onSubmit={handleCreateSubmit}
            submitting={isCreating}
            onPendingFilesChange={setPendingFiles}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AchievementPage;
