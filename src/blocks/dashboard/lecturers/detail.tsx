"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";

import { PageTitle } from "@/components/layouts/page-title";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getAllLecturers, getLecturerAdvisees } from "@/services/lecturers";
import { usePermissions } from "@/services/auth";
import Link from "next/link";

const formatDateSafe = (value: string | undefined) => {
  if (!value) return "-";
  try {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return format(dt, "dd MMM yyyy, HH:mm");
  } catch {
    return value;
  }
};

const LecturerDetail = () => {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("user:manage");

  const lecturerId = useMemo(() => {
    const raw = params?.id;
    if (!raw) return "";
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw;
  }, [params]);

  const { data: lecturers, isLoading: isLoadingLecturers } = useQuery({
    queryKey: ["lecturers"],
    queryFn: () => getAllLecturers(),
    refetchOnWindowFocus: false,
  });

  const lecturer = useMemo(() => {
    if (!lecturers || !lecturerId) return null;
    return lecturers.find((l) => l.id === lecturerId) || null;
  }, [lecturers, lecturerId]);

  const { data: advisees, isLoading: isLoadingAdvisees } = useQuery({
    queryKey: ["lecturers", lecturerId, "advisees"],
    queryFn: () => getLecturerAdvisees(lecturerId),
    enabled: Boolean(lecturerId),
    refetchOnWindowFocus: false,
  });

  if (!canManage) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Dosen Wali" />
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk melihat halaman ini.
          </p>
        </div>
      </section>
    );
  }

  if (isLoadingLecturers) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Dosen Wali" />
        <div className="mt-4 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (!lecturer) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Dosen Wali" />
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-destructive">Dosen wali tidak ditemukan.</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="mb-4">
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>

      <PageTitle title="Detail Dosen Wali" />

      <div className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dosen Wali</CardTitle>
            <CardDescription>Data lengkap dosen wali</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm font-mono">{lecturer.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  NIDN
                </p>
                <p className="text-sm">{lecturer.lecturer_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nama
                </p>
                <p className="text-sm">{lecturer.full_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Departemen
                </p>
                <p className="text-sm">{lecturer.department || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  User ID
                </p>
                <p className="text-sm font-mono">{lecturer.user_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dibuat
                </p>
                <p className="text-sm">{formatDateSafe(lecturer.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mahasiswa Bimbingan</CardTitle>
            <CardDescription>Daftar mahasiswa yang dibimbing</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAdvisees ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : advisees && advisees.length > 0 ? (
              <div className="space-y-2">
                {advisees.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/dashboard/students/${student.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {student.full_name || student.student_id}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {student.student_id} • {student.program_study || "-"}{" "}
                          • {student.academic_year || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada mahasiswa bimbingan
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LecturerDetail;
