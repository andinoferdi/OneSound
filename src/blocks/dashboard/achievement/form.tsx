"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FilePondUpload } from "@/components/ui/filepond-upload";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileOrigin, type FilePondFile } from "filepond";
import { X } from "lucide-react";
import type { DateRange } from "react-day-picker";

export type AchievementType =
  | "academic"
  | "competition"
  | "organization"
  | "publication"
  | "certification"
  | "other";

export type CompetitionLevel =
  | "international"
  | "national"
  | "regional"
  | "local";

export type PublicationType = "journal" | "conference" | "book";

export interface Period {
  start: string | null; // ISO string (date)
  end: string | null;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface AchievementDetails {
  competitionName?: string | null;
  competitionLevel?: CompetitionLevel | null;
  rank?: number | null;
  medalType?: string | null;

  publicationType?: PublicationType | null;
  publicationTitle?: string | null;
  authors?: string[];

  publisher?: string | null;
  issn?: string | null;

  organizationName?: string | null;
  position?: string | null;
  period?: Period | null;

  certificationName?: string | null;
  issuedBy?: string | null;
  certificationNumber?: string | null;
  validUntil?: string | null; // ISO date

  eventDate?: string | null; // ISO date
  location?: string | null;
  organizer?: string | null;
  score?: number | null;

  customFields?: Record<string, unknown>;
}

export interface AchievementFormValues {
  achievementType: AchievementType;
  title: string;
  description: string;
  points: number;
  tags: string[];
  details: AchievementDetails;
  attachments?: Attachment[];
}

export interface AchievementFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<AchievementFormValues>;
  onSubmit?: (values: AchievementFormValues) => Promise<void> | void;
  submitting?: boolean;
  onPendingFilesChange?: (files: File[]) => void;
}

const NONE = "__none__";

function safeText(v: unknown): string {
  return String(v ?? "").trim();
}

function isAttachment(x: unknown): x is Attachment {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.fileName === "string" &&
    typeof o.fileUrl === "string" &&
    typeof o.fileType === "string" &&
    typeof o.uploadedAt === "string"
  );
}

function formatDateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateString(dateStr: string | null | undefined): Date | undefined {
  if (!dateStr) return undefined;

  // yyyy-mm-dd
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    const d = new Date(year, month, day);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function AchievementForm({
  mode = "create",
  initialValues,
  onSubmit,
  submitting: externalSubmitting,
  onPendingFilesChange,
}: AchievementFormProps) {
  const [achievementType, setAchievementType] = useState<AchievementType>(
    (initialValues?.achievementType as AchievementType) ?? "academic"
  );

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );

  // pakai string supaya input number bisa kosong tanpa bikin UI “loncat”
  const [pointsInput, setPointsInput] = useState<string>(
    initialValues?.points != null ? String(initialValues.points) : "0"
  );

  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);

  const [details, setDetails] = useState<AchievementDetails>({
    competitionName: initialValues?.details?.competitionName ?? null,
    competitionLevel:
      (initialValues?.details?.competitionLevel as CompetitionLevel) ?? null,
    rank: initialValues?.details?.rank ?? null,
    medalType: initialValues?.details?.medalType ?? null,

    publicationType:
      (initialValues?.details?.publicationType as PublicationType) ?? null,
    publicationTitle: initialValues?.details?.publicationTitle ?? null,
    authors: initialValues?.details?.authors ?? [],

    publisher: initialValues?.details?.publisher ?? null,
    issn: initialValues?.details?.issn ?? null,

    organizationName: initialValues?.details?.organizationName ?? null,
    position: initialValues?.details?.position ?? null,
    period: initialValues?.details?.period ?? { start: null, end: null },

    certificationName: initialValues?.details?.certificationName ?? null,
    issuedBy: initialValues?.details?.issuedBy ?? null,
    certificationNumber: initialValues?.details?.certificationNumber ?? null,
    validUntil: initialValues?.details?.validUntil ?? null,

    eventDate: initialValues?.details?.eventDate ?? null,
    location: initialValues?.details?.location ?? null,
    organizer: initialValues?.details?.organizer ?? null,
    score: initialValues?.details?.score ?? null,

    customFields: initialValues?.details?.customFields ?? {},
  });

  const [authorInput, setAuthorInput] = useState("");

  const existingAttachments = useMemo(
    () => initialValues?.attachments ?? [],
    [initialValues?.attachments]
  );
  const [attachments, setAttachments] =
    useState<Attachment[]>(existingAttachments);

  const [localSubmitting, setLocalSubmitting] = useState(false);
  const submitting = externalSubmitting ?? localSubmitting;

  // sync state kalau initialValues baru masuk (edit mode biasanya async)
  useEffect(() => {
    if (!initialValues) return;

    setAchievementType(
      (initialValues.achievementType as AchievementType) ?? "academic"
    );
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setPointsInput(
      initialValues.points != null ? String(initialValues.points) : "0"
    );
    setTags(initialValues.tags ?? []);
    setAttachments(initialValues.attachments ?? []);

    setDetails({
      competitionName: initialValues?.details?.competitionName ?? null,
      competitionLevel:
        (initialValues?.details?.competitionLevel as CompetitionLevel) ?? null,
      rank: initialValues?.details?.rank ?? null,
      medalType: initialValues?.details?.medalType ?? null,

      publicationType:
        (initialValues?.details?.publicationType as PublicationType) ?? null,
      publicationTitle: initialValues?.details?.publicationTitle ?? null,
      authors: initialValues?.details?.authors ?? [],

      publisher: initialValues?.details?.publisher ?? null,
      issn: initialValues?.details?.issn ?? null,

      organizationName: initialValues?.details?.organizationName ?? null,
      position: initialValues?.details?.position ?? null,
      period: initialValues?.details?.period ?? { start: null, end: null },

      certificationName: initialValues?.details?.certificationName ?? null,
      issuedBy: initialValues?.details?.issuedBy ?? null,
      certificationNumber: initialValues?.details?.certificationNumber ?? null,
      validUntil: initialValues?.details?.validUntil ?? null,

      eventDate: initialValues?.details?.eventDate ?? null,
      location: initialValues?.details?.location ?? null,
      organizer: initialValues?.details?.organizer ?? null,
      score: initialValues?.details?.score ?? null,

      customFields: initialValues?.details?.customFields ?? {},
    });
  }, [initialValues]);

  useEffect(() => {
    setAttachments(existingAttachments);
  }, [existingAttachments]);

  function toAbsoluteUrl(url: string) {
    const u = safeText(url);
    if (!u) return "";
    if (u.startsWith("http")) return u;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${u}`;
  }

  const initialPondFiles = useMemo(() => {
    return existingAttachments
      .filter((att) => !!att?.fileUrl)
      .map((att) => {
        const abs = toAbsoluteUrl(att.fileUrl);
        return {
          source: abs,
          options: {
            type: "local" as const,
            file: { name: att.fileName, type: att.fileType },
            metadata: {
              poster: abs,
              attachment: att,
            },
          },
        };
      });
  }, [existingAttachments]);

  const isCompetition = achievementType === "competition";
  const isPublication = achievementType === "publication";
  const isOrganization = achievementType === "organization";
  const isCertification = achievementType === "certification";
  const showEventDate =
    achievementType === "competition" || achievementType === "academic";

  function handleAddTag() {
    const value = tagsInput.trim();
    if (!value) return;

    // duplikat case-insensitive
    const exists = tags.some((t) => t.toLowerCase() === value.toLowerCase());
    if (exists) {
      setTagsInput("");
      return;
    }

    setTags((prev) => [...prev, value]);
    setTagsInput("");
  }

  function handleRemoveTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleAddAuthor() {
    const value = authorInput.trim();
    if (!value) return;

    const authors = details.authors ?? [];
    const exists = authors.some((a) => a.toLowerCase() === value.toLowerCase());
    if (exists) {
      setAuthorInput("");
      return;
    }

    setDetails((prev) => ({ ...prev, authors: [...authors, value] }));
    setAuthorInput("");
  }

  function handleRemoveAuthor(name: string) {
    setDetails((prev) => ({
      ...prev,
      authors: (prev.authors ?? []).filter((a) => a !== name),
    }));
  }

  function updateDetails<K extends keyof AchievementDetails>(
    key: K,
    value: AchievementDetails[K]
  ) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  function handlePeriodChange(range: DateRange | undefined) {
    setDetails((prev) => ({
      ...prev,
      period:
        range?.from && range?.to
          ? {
              start: formatDateToLocalString(range.from),
              end: formatDateToLocalString(range.to),
            }
          : null,
    }));
  }

  function getPeriodDateRange(): DateRange | undefined {
    const start = parseDateString(details.period?.start);
    const end = parseDateString(details.period?.end);
    if (start && end) return { from: start, to: end };
    return undefined;
  }

  function handleFileChange(fileItems: FilePondFile[] | null) {
    const items = fileItems ?? [];

    const nextAttachments: Attachment[] = items
      .filter((item) => item?.origin === FileOrigin.LOCAL)
      .map((item) => {
        try {
          const meta = item.getMetadata("attachment");
          return isAttachment(meta) ? meta : null;
        } catch {
          return null;
        }
      })
      .filter((x): x is Attachment => !!x);

    const nextPendingFiles: File[] = items
      .filter((item) => item?.origin === FileOrigin.INPUT)
      .map((item) => item.file)
      .filter((f): f is File => f instanceof File);

    setAttachments(
      nextAttachments.length ? nextAttachments : existingAttachments
    );
    onPendingFilesChange?.(nextPendingFiles);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Title dan description wajib diisi");
      return;
    }

    const pointsNum = Number(pointsInput);
    const points = Number.isFinite(pointsNum) ? Math.max(0, pointsNum) : 0;

    const payload: AchievementFormValues = {
      achievementType,
      title: title.trim(),
      description: description.trim(),
      points,
      tags,
      details: {
        ...details,
        authors: (details.authors ?? []).map((a) => a.trim()).filter(Boolean),

        competitionName: details.competitionName?.trim() || null,
        medalType: details.medalType?.trim() || null,

        publicationTitle: details.publicationTitle?.trim() || null,
        publisher: details.publisher?.trim() || null,
        issn: details.issn?.trim() || null,

        organizationName: details.organizationName?.trim() || null,
        position: details.position?.trim() || null,

        certificationName: details.certificationName?.trim() || null,
        issuedBy: details.issuedBy?.trim() || null,
        certificationNumber: details.certificationNumber?.trim() || null,

        location: details.location?.trim() || null,
        organizer: details.organizer?.trim() || null,
      },
      attachments,
    };

    if (!onSubmit) {
      console.warn("AchievementForm di-submit, tapi tidak ada onSubmit prop.");
      return;
    }

    try {
      setLocalSubmitting(true);
      await onSubmit(payload);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data prestasi");
    } finally {
      setLocalSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border p-4 md:p-6"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Tambah Prestasi" : "Edit Prestasi"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Isi data prestasi sesuai format yang diminta sistem.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="achievementType">Jenis Prestasi</Label>
          <Select
            value={achievementType}
            onValueChange={(val) => setAchievementType(val as AchievementType)}
            disabled={submitting}
          >
            <SelectTrigger id="achievementType" className="w-full">
              <SelectValue placeholder="Pilih jenis prestasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academic" textValue="Akademik">
                Akademik
              </SelectItem>
              <SelectItem value="competition" textValue="Kompetisi">
                Kompetisi
              </SelectItem>
              <SelectItem value="organization" textValue="Organisasi">
                Organisasi
              </SelectItem>
              <SelectItem value="publication" textValue="Publikasi">
                Publikasi
              </SelectItem>
              <SelectItem value="certification" textValue="Sertifikasi">
                Sertifikasi
              </SelectItem>
              <SelectItem value="other" textValue="Lainnya">
                Lainnya
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Poin</Label>
          <Input
            id="points"
            type="number"
            min={0}
            value={pointsInput}
            disabled={submitting}
            onChange={(e) => setPointsInput(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Judul Prestasi</Label>
        <Input
          id="title"
          value={title}
          disabled={submitting}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Juara 1 Lomba Web Development Tingkat Nasional"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          disabled={submitting}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Jelaskan detail prestasi, konteks lomba / kegiatan, kontribusi Anda, dll."
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Tambahkan tag lalu tekan Enter / klik Tambah"
            value={tagsInput}
            disabled={submitting}
            onChange={(e) => setTagsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="outline"
            disabled={submitting}
          >
            Tambah
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex"
                  disabled={submitting}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isCompetition && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Detail Lomba / Kompetisi</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="competitionName">Nama Kompetisi</Label>
              <Input
                id="competitionName"
                value={details.competitionName ?? ""}
                disabled={submitting}
                onChange={(e) =>
                  updateDetails("competitionName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitionLevel">Level Kompetisi</Label>
              <Select
                value={details.competitionLevel ?? NONE}
                disabled={submitting}
                onValueChange={(val) =>
                  updateDetails(
                    "competitionLevel",
                    val === NONE ? null : (val as CompetitionLevel)
                  )
                }
              >
                <SelectTrigger id="competitionLevel" className="w-full">
                  <SelectValue placeholder="Pilih level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE} textValue="Tidak dipilih">
                    Tidak dipilih
                  </SelectItem>
                  <SelectItem value="international" textValue="Internasional">
                    Internasional
                  </SelectItem>
                  <SelectItem value="national" textValue="Nasional">
                    Nasional
                  </SelectItem>
                  <SelectItem value="regional" textValue="Regional">
                    Regional
                  </SelectItem>
                  <SelectItem value="local" textValue="Lokal">
                    Lokal
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank">Peringkat</Label>
              <Input
                id="rank"
                type="number"
                min={1}
                value={details.rank ?? ""}
                disabled={submitting}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") return updateDetails("rank", null);
                  const n = parseInt(v, 10);
                  if (!Number.isNaN(n) && n >= 1) updateDetails("rank", n);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medalType">Jenis Medali</Label>
              <Select
                value={details.medalType ?? NONE}
                disabled={submitting}
                onValueChange={(val) =>
                  updateDetails("medalType", val === NONE ? null : val)
                }
              >
                <SelectTrigger id="medalType" className="w-full">
                  <SelectValue placeholder="Pilih jenis medali" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE} textValue="Tidak dipilih">
                    Tidak dipilih
                  </SelectItem>
                  <SelectItem value="Emas" textValue="Emas">
                    Emas
                  </SelectItem>
                  <SelectItem value="Perak" textValue="Perak">
                    Perak
                  </SelectItem>
                  <SelectItem value="Perunggu" textValue="Perunggu">
                    Perunggu
                  </SelectItem>
                  <SelectItem value="Lainnya" textValue="Lainnya">
                    Lainnya
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {isPublication && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Detail Publikasi</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publicationType">Tipe Publikasi</Label>
              <Select
                value={details.publicationType ?? NONE}
                disabled={submitting}
                onValueChange={(val) =>
                  updateDetails(
                    "publicationType",
                    val === NONE ? null : (val as PublicationType)
                  )
                }
              >
                <SelectTrigger id="publicationType" className="w-full">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE} textValue="Tidak dipilih">
                    Tidak dipilih
                  </SelectItem>
                  <SelectItem value="journal" textValue="Jurnal">
                    Jurnal
                  </SelectItem>
                  <SelectItem value="conference" textValue="Konferensi">
                    Konferensi
                  </SelectItem>
                  <SelectItem value="book" textValue="Buku">
                    Buku
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publicationTitle">Judul Publikasi</Label>
              <Input
                id="publicationTitle"
                value={details.publicationTitle ?? ""}
                disabled={submitting}
                onChange={(e) =>
                  updateDetails("publicationTitle", e.target.value)
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Penulis</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nama penulis"
                  value={authorInput}
                  disabled={submitting}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAuthor();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAuthor}
                  disabled={submitting}
                >
                  Tambah
                </Button>
              </div>

              {details.authors && details.authors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {details.authors.map((author) => (
                    <Badge
                      key={author}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span>{author}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(author)}
                        className="ml-1 inline-flex"
                        disabled={submitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">Penerbit</Label>
              <Input
                id="publisher"
                value={details.publisher ?? ""}
                disabled={submitting}
                onChange={(e) => updateDetails("publisher", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issn">ISSN</Label>
              <Input
                id="issn"
                value={details.issn ?? ""}
                disabled={submitting}
                onChange={(e) => updateDetails("issn", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {isOrganization && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Detail Organisasi</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Nama Organisasi</Label>
              <Input
                id="organizationName"
                value={details.organizationName ?? ""}
                disabled={submitting}
                onChange={(e) =>
                  updateDetails("organizationName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Jabatan</Label>
              <Input
                id="position"
                value={details.position ?? ""}
                disabled={submitting}
                onChange={(e) => updateDetails("position", e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Periode</Label>
              <DateRangePicker
                value={getPeriodDateRange()}
                onChange={handlePeriodChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {isCertification && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Detail Sertifikasi</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="certificationName">Nama Sertifikasi</Label>
              <Input
                id="certificationName"
                value={details.certificationName ?? ""}
                disabled={submitting}
                onChange={(e) =>
                  updateDetails("certificationName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuedBy">Diterbitkan Oleh</Label>
              <Input
                id="issuedBy"
                value={details.issuedBy ?? ""}
                disabled={submitting}
                onChange={(e) => updateDetails("issuedBy", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificationNumber">Nomor Sertifikat</Label>
              <Input
                id="certificationNumber"
                value={details.certificationNumber ?? ""}
                disabled={submitting}
                onChange={(e) =>
                  updateDetails("certificationNumber", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Berlaku Sampai</Label>
              <DatePicker
                value={parseDateString(details.validUntil)}
                onChange={(date) =>
                  updateDetails(
                    "validUntil",
                    date ? formatDateToLocalString(date) : null
                  )
                }
                placeholder="Pilih tanggal"
                withInput
                className="w-full"
                disabled={submitting}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-sm font-semibold">
          Informasi Acara & Skor / Nilai
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {showEventDate && (
            <div className="space-y-2">
              <Label htmlFor="eventDate">Tanggal Acara</Label>
              <DatePicker
                value={parseDateString(details.eventDate)}
                onChange={(date) =>
                  updateDetails(
                    "eventDate",
                    date ? formatDateToLocalString(date) : null
                  )
                }
                placeholder="Pilih tanggal acara"
                withInput
                className="w-full"
                disabled={submitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input
              id="location"
              value={details.location ?? ""}
              disabled={submitting}
              onChange={(e) => updateDetails("location", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer">Penyelenggara</Label>
            <Input
              id="organizer"
              value={details.organizer ?? ""}
              disabled={submitting}
              onChange={(e) => updateDetails("organizer", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Skor / Nilai (opsional)</Label>
            <Input
              id="score"
              type="number"
              value={details.score ?? ""}
              disabled={submitting}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") return updateDetails("score", null);
                const n = Number(v);
                if (!Number.isNaN(n)) updateDetails("score", n);
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-sm font-semibold">Attachments</h3>

        <div className="space-y-2">
          <Label>Unggah File</Label>
          <FilePondUpload
            allowMultiple
            maxFiles={10}
            instantUpload={false}
            allowProcess={false}
            allowRevert={false}
            acceptedFileTypes={[
              "application/pdf",
              "image/jpeg",
              "image/jpg",
              "image/png",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]}
            initialFiles={initialPondFiles}
            onupdatefiles={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            Format yang didukung: PDF, JPG, PNG, DOC, DOCX. Maksimal 10MB per
            file.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Menyimpan..."
            : mode === "create"
            ? "Simpan Prestasi"
            : "Update Prestasi"}
        </Button>
      </div>
    </form>
  );
}
