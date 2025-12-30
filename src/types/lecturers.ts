export interface Lecturer {
  id: string;
  user_id: string;
  lecturer_id: string;
  department: string;
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

export type GetAllLecturersResponse = ApiSuccess<Lecturer[]>;
export type GetLecturerByIDResponse = ApiSuccess<Lecturer>;
