"use client";

import * as React from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useLecturerReport,
  useCurrentLecturerReport,
} from "@/services/reports";
import type { AchievementType } from "@/types/achievement";
import type { LecturerReportData } from "@/types/reports";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCog, Users, Trophy, GraduationCap } from "lucide-react";

const achievementTypeConfig: Record<
  AchievementType,
  { label: string; color: string }
> = {
  academic: { label: "Akademik", color: "bg-[var(--achievement-academic)]" },
  competition: {
    label: "Kompetisi",
    color: "bg-[var(--achievement-competition)]",
  },
  organization: {
    label: "Organisasi",
    color: "bg-[var(--achievement-organization)]",
  },
  publication: {
    label: "Publikasi",
    color: "bg-[var(--achievement-publication)]",
  },
  certification: {
    label: "Sertifikasi",
    color: "bg-[var(--achievement-certification)]",
  },
  other: { label: "Lainnya", color: "bg-[var(--achievement-other)]" },
};

interface LecturerReportCardProps {
  lecturerId?: string;
  data?: LecturerReportData;
}

const LecturerReportCard = ({
  lecturerId,
  data: propData,
}: LecturerReportCardProps) => {
  const {
    data: dataFromId,
    isLoading: isLoadingFromId,
    error: errorFromId,
  } = useLecturerReport(propData ? null : lecturerId || null);
  const {
    data: currentData,
    isLoading: isLoadingCurrent,
    error: errorCurrent,
  } = useCurrentLecturerReport(!propData && !lecturerId);

  const data = propData || dataFromId || currentData;
  const isLoading = propData ? false : isLoadingFromId || isLoadingCurrent;
  const error = propData ? null : errorFromId || errorCurrent;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-32 w-full animate-pulse rounded bg-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              Gagal memuat data laporan. Silakan coba lagi.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Data laporan tidak ditemukan.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { lecturer, statistics, topAdvisees } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Laporan Dosen Wali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Nama</span>
                <span className="text-sm font-semibold text-gray-900">
                  {lecturer.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">NIP</span>
                <span className="text-sm font-semibold text-gray-900">
                  {lecturer.lecturer_id}
                </span>
              </div>
              {lecturer.department && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Departemen
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {lecturer.department}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Users className="h-4 w-4 text-blue-600" />
                Total Mahasiswa Bimbingan
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-950">
                {statistics.total_advisees}
              </div>
            </div>
            <div className="rounded-lg border bg-green-100 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Trophy className="h-4 w-4 text-green-600" />
                Total Prestasi
              </div>
              <div className="mt-2 text-2xl font-bold text-green-800">
                {statistics.total_achievements}
              </div>
            </div>
            <div className="rounded-lg border bg-purple-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Trophy className="h-4 w-4 text-purple-600" />
                Total Points
              </div>
              <div className="mt-2 text-2xl font-bold text-purple-600">
                {statistics.total_points.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Prestasi per Tipe
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Object.entries(achievementTypeConfig).map(([type, config]) => {
                const count = statistics.by_type[type] || 0;
                return (
                  <div
                    key={type}
                    className={`${config.color} rounded-lg p-3 text-center text-white`}
                  >
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs font-medium opacity-90">
                      {config.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Mahasiswa Bimbingan</CardTitle>
        </CardHeader>
        <CardContent>
          {topAdvisees.length > 0 ? (
            <div className="space-y-3">
              {topAdvisees.map((advisee, index) => (
                <Link
                  key={advisee.student_id}
                  href={`/dashboard/students/${advisee.student_id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 bg-blue-100">
                      <AvatarFallback className="bg-blue-100">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {advisee.student_name}
                        </span>
                        <span className="rounded-full border border-blue-500 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
                        <span>{advisee.total_points} Points</span>
                        <span>{advisee.achievement_count} Prestasi</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada mahasiswa bimbingan dengan prestasi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LecturerReportCard;
