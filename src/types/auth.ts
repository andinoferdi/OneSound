import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username atau email harus diisi'),
  password: z.string().min(1, 'Password harus diisi').min(6, 'Password minimal 6 karakter')
});

export type LoginFormData = z.infer<typeof loginSchema>;

// API response types
export interface LoginUserResponse {
  id: string;
  username: string;
  fullName: string;
  role: string;
  permissions: string[];
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
    refreshToken: string;
    user: LoginUserResponse;
  };
}

export interface ProfileResponse {
  status: string;
  data: {
    user_id: string;
    username: string;
    email: string;
    full_name: string;
    role_id: string;
    role: string;
    permissions: string[];
  };
}

export interface CurrentUserResponse {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  role_id: string;
  role?: string;
  permissions?: string[];
}

export interface LoginError {
  status: string;
  data: {
    message: string;
  };
}
