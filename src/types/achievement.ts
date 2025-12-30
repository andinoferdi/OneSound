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

export type AchievementStatus =
  | "draft"
  | "submitted"
  | "verified"
  | "rejected"
  | "deleted";

export interface Period {
  start: string;
  end: string;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface AchievementDetails {
  competitionName?: string | null;
  competitionLevel?: CompetitionLevel | string | null;
  rank?: number | null;
  medalType?: string | null;

  publicationType?: PublicationType | string | null;
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
  validUntil?: string | null;

  eventDate?: string | null;
  location?: string | null;
  organizer?: string | null;
  score?: number | null;

  customFields?: Record<string, unknown> | null;
}

export interface AchievementBase {
  id: string;
  studentId: string;
  achievementType: AchievementType | string;
  title: string;
  description: string;
  details: AchievementDetails;
  attachments?: Attachment[] | null;
  tags?: string[];
  points: number;
  createdAt: string;
  updatedAt: string;
}


export type Achievement = AchievementBase & {
  status?: AchievementStatus | string;
  submitted_at?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_note?: string | null;
};

export type AchievementListItem = AchievementBase & {
  status: AchievementStatus | string;
  student_name?: string;
};

export interface AchievementStats {
  total: number;
  verified: number;
  percentage: number;
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

export type GetAchievementsResponse = ApiSuccess<AchievementListItem[]>;
export type GetAchievementByIdResponse = ApiSuccess<Achievement>;
export type CreateAchievementResponse = ApiSuccess<Achievement>;
export type UpdateAchievementResponse = ApiSuccess<Achievement>;
export type DeleteAchievementResponse =
  | ApiSuccess<null>
  | ApiSuccess<Record<string, never>>;

export type GetAchievementStatsResponse = ApiSuccess<AchievementStats>;

export type UploadAttachmentResponse = ApiSuccess<Attachment>;

export interface CreateAchievementBody {
  achievementType: AchievementType;
  title: string;
  description: string;
  details: AchievementDetails;
  tags?: string[];
  points: number;
}

export interface UpdateAchievementBody {
  achievementType?: AchievementType;
  title?: string;
  description?: string;
  details?: AchievementDetails;
  tags?: string[];
  points?: number;
  attachments?: Attachment[];
}

export interface VerifyAchievementRequest {
  status: "verified";
}

export interface RejectAchievementRequest {
  status: "rejected";
  rejection_note: string;
}

export interface AchievementReference {
  id: string;
  student_id: string;
  mongo_achievement_id: string;
  status: AchievementStatus;
  submitted_at?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AchievementHistoryItem {
  status: AchievementStatus;
  changed_at: string;
  changed_by: string | null;
  changed_by_name: string | null;
  note: string | null;
}

export type GetAchievementHistoryResponse = ApiSuccess<AchievementHistoryItem[]>;
