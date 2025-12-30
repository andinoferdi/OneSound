"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { PageTitle } from "@/components/layouts/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  getAchievementById,
  verifyAchievement,
  rejectAchievement,
  getAchievementHistory,
} from "@/services/achievement";
import type {
  AchievementStatus,
  AchievementHistoryItem,
} from "@/types/achievement";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/services/auth";
import { useInvalidateMutation } from "@/hooks/use-invalidate-mutation";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

type DetailRow = {
  label: string;
  value: string;
};

const getStatusBadge = (status?: AchievementStatus) => {
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

  const key = status ?? "draft";
  const config = statusConfig[key] ?? statusConfig.draft;
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const getTypeLabel = (type?: string) => {
  const typeLabels: Record<string, string> = {
    academic: "Akademik",
    competition: "Kompetisi",
    organization: "Organisasi",
    publication: "Publikasi",
    certification: "Sertifikasi",
    other: "Lainnya",
  };
  if (!type) return "-";
  return typeLabels[type] || type;
};

const getCompetitionLevelLabel = (level?: string) => {
  const levelLabels: Record<string, string> = {
    international: "Internasional",
    national: "Nasional",
    regional: "Regional",
    local: "Lokal",
  };
  if (!level) return "";
  return levelLabels[level] || level;
};

const getPublicationTypeLabel = (type?: string) => {
  const typeLabels: Record<string, string> = {
    journal: "Jurnal",
    conference: "Konferensi",
    book: "Buku",
  };
  if (!type) return "";
  return typeLabels[type] || type;
};

const toText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatDateSafe = (value: unknown) => {
  const text = toText(value);
  if (!text) return "";
  const dt = new Date(text);
  if (Number.isNaN(dt.getTime())) return text;
  try {
    return format(dt, "dd MMM yyyy, HH:mm");
  } catch {
    return text;
  }
};

const buildAbsoluteUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

const getErrorMessage = (err: unknown) => {
  const error = err as {
    message?: string;
    response?: { data?: { data?: { message?: string }; message?: string } };
    data?: { message?: string };
  };
  return (
    error?.response?.data?.data?.message ||
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

const AchievementDetail = () => {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { user: contextUser } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const userData = currentUser || contextUser;

  interface UserData {
    role?: string;
    roleName?: string;
  }

  const userRole = String(
    (userData as UserData)?.role || (userData as UserData)?.roleName || ""
  ).toLowerCase();
  const isDosenWali = userRole === "dosen wali" || userRole === "dosenwali";

  const [openReject, setOpenReject] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");

  const achievementId = useMemo(() => {
    const raw = params?.id;
    if (!raw) return "";
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw;
  }, [params]);

  const {
    data: achievement,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["achievements", achievementId],
    queryFn: () => getAchievementById(achievementId),
    enabled: Boolean(achievementId),
    refetchOnWindowFocus: false,
  });

  const {
    data: history,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery<AchievementHistoryItem[]>({
    queryKey: ["achievements", achievementId, "history"],
    queryFn: () => getAchievementHistory(achievementId),
    enabled: Boolean(achievementId),
    refetchOnWindowFocus: false,
  });

  const detailRows = useMemo<DetailRow[]>(() => {
    if (!achievement) return [];

    const achievementType = achievement.achievementType as string;
    const details =
      (achievement as unknown as { details?: Record<string, unknown> })
        .details ?? {};
    const rows: DetailRow[] = [];

    const put = (label: string, value: unknown) => {
      const text = toText(value);
      if (!text) return;
      rows.push({ label, value: text });
    };

    if (achievementType === "competition") {
      put("Nama Kompetisi", details.competitionName);
      if (details.competitionLevel) {
        rows.push({
          label: "Level Kompetisi",
          value: getCompetitionLevelLabel(String(details.competitionLevel)),
        });
      }
      put("Peringkat", details.rank);
      put("Jenis Medali", details.medalType);
    } else if (achievementType === "publication") {
      if (details.publicationType) {
        rows.push({
          label: "Tipe Publikasi",
          value: getPublicationTypeLabel(String(details.publicationType)),
        });
      }
      put("Judul Publikasi", details.publicationTitle);
      put("Penulis", details.authors);
      put("Penerbit", details.publisher);
      put("ISSN", details.issn);
    } else if (achievementType === "organization") {
      put("Nama Organisasi", details.organizationName);
      put("Posisi", details.position);
      const period = details.period as unknown as
        | { start?: string | null; end?: string | null }
        | null
        | undefined;
      if (period?.start || period?.end) {
        const startText = period.start ? formatDateSafe(period.start) : "-";
        const endText = period.end ? formatDateSafe(period.end) : "-";
        rows.push({
          label: "Periode",
          value: `${startText} sampai ${endText}`,
        });
      }
    } else if (achievementType === "certification") {
      put("Nama Sertifikasi", details.certificationName);
      put("Diterbitkan Oleh", details.issuedBy);
      put("Nomor Sertifikasi", details.certificationNumber);
      if (details.validUntil) {
        rows.push({
          label: "Berlaku Sampai",
          value: formatDateSafe(details.validUntil),
        });
      }
    } else if (achievementType === "academic" || achievementType === "other") {
      if (details.eventDate) {
        rows.push({
          label: "Tanggal Kegiatan",
          value: formatDateSafe(details.eventDate),
        });
      }
      put("Lokasi", details.location);
      put("Penyelenggara", details.organizer);
      put("Skor", details.score);
    }

    if (details.customFields) {
      rows.push({
        label: "Field Tambahan",
        value: toText(details.customFields),
      });
    }

    return rows;
  }, [achievement]);

  const attachments = useMemo(() => {
    if (!achievement || !achievement.attachments) return [];
    if (!Array.isArray(achievement.attachments)) return [];
    return achievement.attachments;
  }, [achievement]);

  const handleBack = () => router.back();

  const handleRefresh = async () => {
    await refetch();
  };

  const verifyMutation = useInvalidateMutation({
    mutationFn: (id: string) => verifyAchievement(id),
    invalidates: [["achievements"]],
    onSuccess: async () => {
      toast.success("Prestasi berhasil diverifikasi");
      await refetch();
    },
  });

  const rejectMutation = useInvalidateMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      rejectAchievement(id, note),
    invalidates: [["achievements"]],
    onSuccess: async () => {
      toast.success("Prestasi berhasil ditolak");
      setOpenReject(false);
      setRejectionNote("");
      await refetch();
    },
  });

  const handleVerify = async () => {
    if (!achievementId) return;
    try {
      await verifyMutation.mutateAsync(achievementId);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleReject = async () => {
    if (!achievementId) return;
    if (!rejectionNote.trim()) {
      toast.error("Catatan penolakan wajib diisi");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        id: achievementId,
        note: rejectionNote.trim(),
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const achievementStatus = achievement?.status as
    | AchievementStatus
    | undefined;
  const canVerify = isDosenWali && achievementStatus === "submitted";
  const canReject = isDosenWali && achievementStatus === "submitted";

  if (!achievementId) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Prestasi" />
        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="text-sm">ID tidak valid</p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                aria-label="Kembali"
                className="cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Prestasi" />
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Memuat...</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!achievement || error) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Prestasi" />
        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="text-sm">Data tidak ditemukan</p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                aria-label="Kembali"
                className="cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isFetching}
                aria-label="Muat ulang data"
                className="cursor-pointer"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Muat Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PageTitle title="Detail Prestasi" />
        <div className="flex items-center gap-2">
          {canVerify && (
            <Button
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {verifyMutation.isPending ? "Memverifikasi..." : "Verifikasi"}
            </Button>
          )}
          {canReject && (
            <Button
              onClick={() => setOpenReject(true)}
              disabled={rejectMutation.isPending}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Tolak
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleBack}
            aria-label="Kembali"
            className="cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            aria-label="Muat ulang data"
            className="cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat Ulang
          </Button>
        </div>
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-[260px]">
              <p className="text-muted-foreground text-sm">ID</p>
              <p className="font-mono text-sm">
                #{String(achievement.id).slice(-8)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(
                achievement.status as AchievementStatus | undefined
              )}
              <Badge variant="secondary">
                {getTypeLabel(achievement.achievementType)}
              </Badge>
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-border" />

          {achievementStatus === "rejected" && achievement.rejection_note && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Catatan Penolakan
              </p>
              <p className="mt-1 text-sm whitespace-pre-line">
                {achievement.rejection_note}
              </p>
            </div>
          )}

          {achievementStatus === "verified" &&
            (achievement.verified_at || achievement.verified_by) && (
              <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  Informasi Verifikasi
                </p>
                <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                  {achievement.verified_at && (
                    <div>
                      <p className="text-xs text-green-700">
                        Diverifikasi Pada
                      </p>
                      <p className="text-sm text-green-900">
                        {formatDateSafe(achievement.verified_at)}
                      </p>
                    </div>
                  )}
                  {achievement.verified_by && (
                    <div>
                      <p className="text-xs text-green-700">
                        Diverifikasi Oleh
                      </p>
                      <p className="text-sm text-green-900">
                        {achievement.verified_by}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Judul</p>
              <p className="text-sm font-medium">{achievement.title || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Poin</p>
              <p className="text-sm font-medium">
                {String(achievement.points ?? 0)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground text-sm">Deskripsi</p>
            <p className="text-sm whitespace-pre-line">
              {achievement.description || "-"}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground text-sm">Tag</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(achievement.tags) &&
              achievement.tags.length > 0 ? (
                achievement.tags.map((t: string) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))
              ) : (
                <p className="text-sm">-</p>
              )}
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-border" />

          <div className="mt-4">
            <p className="text-sm font-medium">Detail</p>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {detailRows.length > 0 ? (
                detailRows.map((row) => (
                  <div key={row.label} className="rounded-md border p-3">
                    <p className="text-muted-foreground text-sm">{row.label}</p>
                    <p className="text-sm">
                      {row.label.includes("Tanggal") ||
                      row.label.includes("Berlaku")
                        ? formatDateSafe(row.value)
                        : row.value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm">-</p>
              )}
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-border" />

          <div className="mt-4">
            <p className="text-sm font-medium">Lampiran</p>
            <div className="mt-3 space-y-2">
              {attachments.length > 0 ? (
                attachments.map((a, idx) => {
                  const fileUrl = a.fileUrl ? buildAbsoluteUrl(a.fileUrl) : "";
                  const fileName = a.fileName || `Lampiran ${idx + 1}`;
                  const fileType = a.fileType || "-";
                  const uploadedAt = a.uploadedAt
                    ? formatDateSafe(a.uploadedAt)
                    : "-";

                  return (
                    <div
                      key={`${fileName}.${idx}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="min-w-[240px]">
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-muted-foreground text-sm">
                          {fileType} · {uploadedAt}
                        </p>
                      </div>

                      {fileUrl ? (
                        <Button
                          asChild
                          variant="outline"
                          aria-label={`Buka ${fileName}`}
                          className="cursor-pointer"
                        >
                          <a href={fileUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Buka
                          </a>
                        </Button>
                      ) : (
                        <p className="text-sm">URL tidak ada</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm">-</p>
              )}
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-border" />

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Dibuat Pada</p>
              <p className="text-sm">
                {formatDateSafe(achievement.createdAt) || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Diperbarui Pada</p>
              <p className="text-sm">
                {formatDateSafe(achievement.updatedAt) || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-4">
          <p className="text-sm font-medium">Riwayat Status</p>
          {isLoadingHistory ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-md bg-gray-200"
                />
              ))}
            </div>
          ) : historyError ? (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Gagal memuat riwayat status
              </p>
            </div>
          ) : history && history.length > 0 ? (
            <div className="mt-4 space-y-4">
              {history.map((item: AchievementHistoryItem, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 border-l-2 border-border pl-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <span className="text-muted-foreground text-xs">
                        {formatDateSafe(item.changed_at)}
                      </span>
                    </div>
                    {item.changed_by_name && (
                      <p className="mt-1 text-sm">
                        Oleh: {item.changed_by_name}
                      </p>
                    )}
                    {item.note && (
                      <div className="mt-2 rounded-md border border-muted bg-muted/50 p-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Catatan:
                        </p>
                        <p className="mt-1 text-sm whitespace-pre-line">
                          {item.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Belum ada riwayat status
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
            <Label htmlFor="rejection-note-detail">Catatan Penolakan</Label>
            <Textarea
              id="rejection-note-detail"
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
    </section>
  );
};

export default AchievementDetail;
