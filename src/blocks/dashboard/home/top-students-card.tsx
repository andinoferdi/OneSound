"use client";

import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatistics } from "@/services/reports";

import { GraduationCap, Trophy } from "lucide-react";

const TopStudentsCard = () => {
  const router = useRouter();
  const { data, isLoading, error } = useStatistics();

  const topStudents = data?.topStudents || [];

  const handleStudentClick = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  if (isLoading) {
    return (
      <Card className="w-full border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Top Mahasiswa Berprestasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`py-4 ${
                  index !== 5 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300 sm:h-10 sm:w-10" />
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                    </div>
                    <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="text-center">
                        <div className="mx-auto mb-1 h-4 w-16 animate-pulse rounded bg-gray-300" />
                        <div className="mx-auto h-3 w-20 animate-pulse rounded bg-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Top Mahasiswa Berprestasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-sm text-destructive">
              Terjadi kesalahan saat memuat data top mahasiswa
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Top Mahasiswa Berprestasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topStudents.length > 0 ? (
            topStudents.slice(0, 10).map((student, index) => (
              <div
                key={student.student_id}
                className={`py-4 transition-colors hover:bg-gray-50 ${
                  index !== topStudents.length - 1 && index !== 9
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 shrink-0 bg-blue-100 sm:h-10 sm:w-10">
                        <AvatarFallback className="bg-blue-100">
                          <GraduationCap className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => handleStudentClick(student.student_id)}
                        className="truncate text-left text-sm font-medium text-gray-900 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                        aria-label={`Lihat detail ${student.student_name}`}
                      >
                        {student.student_name}
                      </button>
                    </div>
                    <div className="rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 flex items-center gap-1">
                      <Trophy className="h-3 w-3" />#{index + 1}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center rounded-lg bg-gray-50 p-2">
                      <div className="text-base font-bold text-gray-900">
                        {student.total_points.toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs tracking-wide text-gray-500 uppercase">
                        Total Points
                      </div>
                    </div>
                    <div className="text-center rounded-lg bg-gray-50 p-2">
                      <div className="text-base font-bold text-gray-900">
                        {student.achievement_count}
                      </div>
                      <div className="text-xs tracking-wide text-gray-500 uppercase">
                        Prestasi
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada data top mahasiswa untuk ditampilkan
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopStudentsCard;
