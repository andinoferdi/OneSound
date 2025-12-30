import type { AchievementType, CompetitionLevel } from '@/types/achievement';

export type ByTypeData = Record<AchievementType | string, number>;

export type ByPeriodData = Record<string, number>;

export interface TopStudent {
  student_id: string;
  student_name: string;
  total_points: number;
  achievement_count: number;
}

export type CompetitionLevelDistribution = Record<CompetitionLevel | string, number>;

export interface StatisticsData {
  byType: ByTypeData;
  byPeriod: ByPeriodData;
  topStudents: TopStudent[];
  competitionLevelDistribution: CompetitionLevelDistribution;
}

export type ApiSuccess<T> = {
  status: "success";
  data: T;
};

export type ApiError = {
  status: "error";
  data: {
    message: string;
    [key: string]: unknown;
  };
};

export type StatisticsResponse = ApiSuccess<StatisticsData>;

export interface AchievementDetail {
  id: string;
  title: string;
  achievementType: AchievementType | string;
  points: number;
  status: string;
  createdAt?: string;
  submitted_at?: string | null;
  verified_at?: string | null;
}

export interface StudentReportData {
  student: {
    id: string;
    name: string;
    student_id: string;
  };
  statistics: {
    total_achievements: number;
    total_points: number;
    verified_count: number;
    by_type: ByTypeData;
  };
  achievements: AchievementDetail[];
}

export type StudentReportResponse = ApiSuccess<StudentReportData>;

export interface TopAdvisee {
  student_id: string;
  student_name: string;
  total_points: number;
  achievement_count: number;
}

export interface LecturerReportData {
  lecturer: {
    id: string;
    name: string;
    lecturer_id: string;
    department?: string;
  };
  statistics: {
    total_advisees: number;
    total_achievements: number;
    total_points: number;
    by_type: ByTypeData;
  };
  topAdvisees: TopAdvisee[];
}

export type LecturerReportResponse = ApiSuccess<LecturerReportData>;
