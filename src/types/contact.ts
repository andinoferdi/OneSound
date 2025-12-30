export interface Comment {
  id: number;
  content: string;
  user_name: string;
  profile_image?: string;
  created_at: string;
  is_pinned: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface CommentFormData {
  user_name: string;
  content: string;
  profile_image?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export interface CommentsResponse {
  comments: Comment[];
  count: number;
}
