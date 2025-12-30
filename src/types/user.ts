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

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_id: string;
  is_active?: boolean;
  student_id?: string;
  program_study?: string;
  academic_year?: string;
  advisor_id?: string;
  lecturer_id?: string;
  department?: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  full_name: string;
  role_id: string;
  is_active?: boolean;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  program_study: string;
  academic_year: string;
  advisor_id: string;
  full_name?: string;
  created_at: string;
}

export interface CreateStudentRequest {
  student_id: string;
  program_study?: string;
  academic_year?: string;
  advisor_id?: string;
}

export interface UpdateStudentRequest {
  student_id: string;
  program_study?: string;
  academic_year?: string;
  advisor_id?: string;
}

export interface Lecturer {
  id: string;
  user_id: string;
  lecturer_id: string;
  department: string;
  full_name?: string;
  created_at: string;
}

export interface CreateLecturerRequest {
  lecturer_id: string;
  department?: string;
}

export interface UpdateLecturerRequest {
  lecturer_id: string;
  department?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export type GetAllUsersResponse = ApiSuccess<User[]>;
export type GetUserByIdResponse = ApiSuccess<User>;
export type CreateUserResponse = ApiSuccess<User>;
export type UpdateUserResponse = ApiSuccess<User>;
export type DeleteUserResponse = ApiSuccess<null> | ApiSuccess<Record<string, never>>;

export type GetAllStudentsResponse = ApiSuccess<Student[]>;
export type GetStudentByIdResponse = ApiSuccess<Student>;
export type CreateStudentResponse = ApiSuccess<Student>;
export type UpdateStudentResponse = ApiSuccess<Student>;

export type GetAllLecturersResponse = ApiSuccess<Lecturer[]>;
export type GetLecturerByIdResponse = ApiSuccess<Lecturer>;
export type CreateLecturerResponse = ApiSuccess<Lecturer>;
export type UpdateLecturerResponse = ApiSuccess<Lecturer>;

export type GetAllRolesResponse = ApiSuccess<Role[]>;
export type GetRoleByIdResponse = ApiSuccess<Role>;
