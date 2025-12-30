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

import { getStudentById, getStudentAchievements } from "@/services/students";
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

const StudentDetail = () => {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("user:manage");

  const studentId = useMemo(() => {
    const raw = params?.id;
    if (!raw) return "";
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw;
  }, [params]);

  const {
    data: student,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["students", studentId],
    queryFn: () => getStudentById(studentId),
    enabled: Boolean(studentId),
    refetchOnWindowFocus: false,
  });

  const { data: achievementsData, isLoading: isLoadingAchievements } = useQuery(
    {
      queryKey: ["students", studentId, "achievements"],
      queryFn: () => getStudentAchievements(studentId, 1, 10),
      enabled: Boolean(studentId),
      refetchOnWindowFocus: false,
    }
  );

  if (!canManage) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Mahasiswa" />
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk melihat halaman ini.
          </p>
        </div>
      </section>
    );
  }

  if (isLoading || isFetching) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Mahasiswa" />
        <div className="mt-4 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (error || !student) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Mahasiswa" />
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-destructive">Gagal memuat data mahasiswa.</p>
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

      <PageTitle title="Detail Mahasiswa" />

      <div className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Mahasiswa</CardTitle>
            <CardDescription>Data lengkap mahasiswa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm font-mono">{student.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIM</p>
                <p className="text-sm">{student.student_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nama
                </p>
                <p className="text-sm">{student.full_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Program Studi
                </p>
                <p className="text-sm">{student.program_study || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tahun Akademik
                </p>
                <p className="text-sm">{student.academic_year || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ID Dosen Wali
                </p>
                <p className="text-sm font-mono">{student.advisor_id || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  User ID
                </p>
                <p className="text-sm font-mono">{student.user_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dibuat
                </p>
                <p className="text-sm">{formatDateSafe(student.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prestasi</CardTitle>
            <CardDescription>Daftar prestasi mahasiswa</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAchievements ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : achievementsData?.data && achievementsData.data.length > 0 ? (
              <div className="space-y-2">
                {achievementsData.data.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/dashboard/achievements/${achievement.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {achievement.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.achievementType} • {achievement.points}{" "}
                          poin
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada prestasi
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default StudentDetail;
