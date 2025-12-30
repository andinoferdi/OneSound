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

export type GetAllStudentsResponse = ApiSuccess<Student[]>;
export type GetStudentByIDResponse = ApiSuccess<Student>;
