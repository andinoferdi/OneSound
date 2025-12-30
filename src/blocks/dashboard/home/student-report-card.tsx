"use client";

import * as React from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudentReport, useCurrentStudentReport } from "@/services/reports";
import type { AchievementType } from "@/types/achievement";
import type { StudentReportData } from "@/types/reports";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Trophy, CheckCircle2, Clock } from "lucide-react";

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

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  verified: {
    label: "Terverifikasi",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle2,
  },
  submitted: {
    label: "Menunggu Verifikasi",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
  },
  draft: {
    label: "Draft",
    color: "bg-gray-100 text-gray-900 border-gray-300",
    icon: Clock,
  },
  rejected: {
    label: "Ditolak",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: Clock,
  },
};

interface StudentReportCardProps {
  studentId?: string;
  data?: StudentReportData;
}

const StudentReportCard = ({
  studentId,
  data: propData,
}: StudentReportCardProps) => {
  const {
    data: dataFromId,
    isLoading: isLoadingFromId,
    error: errorFromId,
  } = useStudentReport(propData ? null : studentId || null);
  const {
    data: currentData,
    isLoading: isLoadingCurrent,
    error: errorCurrent,
  } = useCurrentStudentReport(!propData && !studentId);

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

  const { student, statistics, achievements } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Laporan Prestasi Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Nama</span>
                <span className="text-sm font-semibold text-gray-900">
                  {student.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">NIM</span>
                <span className="text-sm font-semibold text-gray-900">
                  {student.student_id}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Trophy className="h-4 w-4 text-blue-600" />
                Total Points
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-950">
                {statistics.total_points.toLocaleString("id-ID")}
              </div>
            </div>
            <div className="rounded-lg border bg-green-100 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Terverifikasi
              </div>
              <div className="mt-2 text-2xl font-bold text-green-800">
                {statistics.verified_count}
              </div>
            </div>
            <div className="rounded-lg border bg-purple-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Trophy className="h-4 w-4 text-purple-600" />
                Total Prestasi
              </div>
              <div className="mt-2 text-2xl font-bold text-purple-600">
                {statistics.total_achievements}
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
          <CardTitle>Daftar Prestasi</CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const statusInfo =
                  statusConfig[achievement.status] || statusConfig.draft;
                const StatusIcon = statusInfo.icon;
                const typeConfig =
                  achievementTypeConfig[
                    achievement.achievementType as AchievementType
                  ] || achievementTypeConfig.other;

                return (
                  <Link
                    key={achievement.id}
                    href={`/dashboard/achievements/${achievement.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`${typeConfig.color} border-0 text-white text-xs`}
                          >
                            {typeConfig.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${statusInfo.color} text-xs flex items-center gap-1`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          {achievement.title}
                        </h4>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          <span>{achievement.points} Points</span>
                          {achievement.createdAt && (
                            <span>
                              {new Date(
                                achievement.createdAt
                              ).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada prestasi yang dilaporkan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentReportCard;
