"use client";

import React from "react";

import { PageTitle } from "@/components/layouts/page-title";
import { usePermissions } from "@/services/auth";
import {
  useCurrentStudentReport,
  useCurrentLecturerReport,
} from "@/services/reports";
import AchievementTypeCards from "./achievement-type-cards";
import AchievementPeriodChart from "./achievement-period-chart";
import TopStudentsCard from "./top-students-card";
import CompetitionLevelChart from "./competition-level-chart";
import StudentReportCard from "./student-report-card";
import LecturerReportCard from "./lecturer-report-card";

const HomePage = () => {
  const { userData } = usePermissions();
  const userRole = userData?.role || "";

  const { data: studentReport, isLoading: isLoadingStudent } =
    useCurrentStudentReport(userRole === "Mahasiswa");
  const { data: lecturerReport, isLoading: isLoadingLecturer } =
    useCurrentLecturerReport(userRole === "Dosen Wali");

  if (userRole === "Mahasiswa") {
    return (
      <section className="space-y-6">
        <PageTitle title="Laporan Prestasi Saya" />
        {isLoadingStudent ? (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="rounded-lg border p-4">
              <div className="space-y-4">
                <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-32 w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ) : (
          <StudentReportCard data={studentReport} />
        )}
      </section>
    );
  }

  if (userRole === "Dosen Wali") {
    return (
      <section className="space-y-6">
        <PageTitle title="Laporan Dosen Wali" />
        {isLoadingLecturer ? (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="rounded-lg border p-4">
              <div className="space-y-4">
                <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-32 w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ) : (
          <LecturerReportCard data={lecturerReport} />
        )}
      </section>
    );
  }

  if (userRole === "Admin" || !userRole) {
    return (
      <section className="space-y-6">
        <PageTitle title="Dashboard Statistik Prestasi" />

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Total Prestasi per Tipe
            </h2>
            <AchievementTypeCards />
          </div>

          <div>
            <AchievementPeriodChart />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopStudentsCard />
            <CompetitionLevelChart />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageTitle title="Dashboard" />
      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      </div>
    </section>
  );
};

export default HomePage;
