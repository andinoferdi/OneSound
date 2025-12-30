export type NotificationType = "achievement_rejected";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  achievement_id?: string | null;
  mongo_achievement_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetNotificationsResponse {
  status: string;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface GetUnreadCountResponse {
  status: string;
  data: {
    count: number;
  };
}

export interface MarkAsReadResponse {
  status: string;
  data: Notification;
}

export interface MarkAllAsReadResponse {
  status: string;
  data: {
    message: string;
  };
}

