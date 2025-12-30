import type {
  ApiError,
  ApiSuccess,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Student,
  CreateStudentRequest,
  Lecturer,
  CreateLecturerRequest,
  Role,
} from "@/types/user";

export type { Student, Lecturer };

type ApiOptions = {
  token?: string;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ""
).replace(/\/$/, "");

function requireBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL belum diset");
  }
  return API_BASE_URL;
}

function buildUrl(path: string) {
  const base = requireBaseUrl();
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth-token');
  } catch {
    return null;
  }
}

function withAuthHeaders(
  headers: HeadersInit | undefined,
  token?: string
): HeadersInit {
  const authToken = token || getTokenFromStorage();
  if (!authToken) return headers ?? {};
  return {
    ...(headers ?? {}),
    Authorization: `Bearer ${authToken}`,
  };
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { status: "error", data: { message: text } };
  }
}

function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  opts: ApiOptions = {}
): Promise<T> {
  const url = buildUrl(path);

  const headers = withAuthHeaders(init.headers, opts.token);

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: opts.credentials || 'include',
    signal: opts.signal,
  });

  const payload = (await readJsonSafe(res)) as
    | ApiSuccess<T>
    | ApiError
    | unknown;

  if (!res.ok) {
    const errorPayload = payload as { error?: string; message?: string; status?: string; data?: { message?: string } } | unknown;
    
    if (typeof errorPayload === "object" && errorPayload !== null) {
      if ("error" in errorPayload && "message" in errorPayload && typeof errorPayload.message === "string") {
        throw new Error(errorPayload.message);
      }
      
      if ("status" in errorPayload && errorPayload.status === "error" && "data" in errorPayload) {
        const data = errorPayload.data;
        if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
          throw new Error(data.message);
        }
      }
    }
    
    throw new Error(`Request gagal (${res.status})`);
  }

  const successPayload = payload as ApiSuccess<T> | unknown;
  if (
    typeof successPayload === "object" &&
    successPayload !== null &&
    "status" in successPayload &&
    successPayload.status === "success" &&
    "data" in successPayload
  ) {
    return (successPayload as ApiSuccess<T>).data;
  }

  return payload as T;
}

const USERS_BASE = "/api/v1/users";
const STUDENTS_BASE = "/api/v1/students";

export async function getUsers(
  opts: ApiOptions = {}
): Promise<User[]> {
  return apiFetch<User[]>(
    `${USERS_BASE}`,
    { method: "GET" },
    opts
  );
}

export async function getUserById(
  id: string,
  opts: ApiOptions = {}
): Promise<User> {
  return apiFetch<User>(
    `${USERS_BASE}/${id}`,
    { method: "GET" },
    opts
  );
}

export async function createUser(
  body: CreateUserRequest,
  opts: ApiOptions = {}
): Promise<User> {
  return apiFetch<User>(
    `${USERS_BASE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    opts
  );
}

export async function updateUser(
  id: string,
  body: UpdateUserRequest,
  opts: ApiOptions = {}
): Promise<User> {
  const payload = pickDefined({
    username: body.username,
    email: body.email,
    full_name: body.full_name,
    role_id: body.role_id,
    is_active: body.is_active,
  });

  return apiFetch<User>(
    `${USERS_BASE}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    opts
  );
}

export async function deleteUser(
  id: string,
  opts: ApiOptions = {}
): Promise<void> {
  await apiFetch<unknown>(
    `${USERS_BASE}/${id}`,
    { method: "DELETE" },
    opts
  );
}

export async function updateUserRole(
  id: string,
  roleId: string,
  opts: ApiOptions = {}
): Promise<unknown> {
  return apiFetch<unknown>(
    `${USERS_BASE}/${id}/role`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role_id: roleId }),
    },
    opts
  );
}

export async function createStudentProfile(
  userId: string,
  body: CreateStudentRequest,
  opts: ApiOptions = {}
): Promise<Student> {
  return apiFetch<Student>(
    `${USERS_BASE}/${userId}/student-profile`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    opts
  );
}

export async function createLecturerProfile(
  userId: string,
  body: CreateLecturerRequest,
  opts: ApiOptions = {}
): Promise<Lecturer> {
  return apiFetch<Lecturer>(
    `${USERS_BASE}/${userId}/lecturer-profile`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    opts
  );
}

export async function updateStudentAdvisor(
  studentId: string,
  advisorId: string,
  opts: ApiOptions = {}
): Promise<unknown> {
  return apiFetch<unknown>(
    `${STUDENTS_BASE}/${studentId}/advisor`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ advisor_id: advisorId || "" }),
    },
    opts
  );
}

export async function getLecturers(
  opts: ApiOptions = {}
): Promise<Lecturer[]> {
  return apiFetch<Lecturer[]>(
    `/api/v1/lecturers`,
    { method: "GET" },
    opts
  );
}

export async function getRoles(
  opts: ApiOptions = {}
): Promise<Role[]> {
  return apiFetch<Role[]>(
    `/api/v1/roles`,
    { method: "GET" },
    opts
  );
}

export async function getStudentByUserId(
  userId: string,
  opts: ApiOptions = {}
): Promise<Student | null> {
  try {
    const students = await apiFetch<Student[]>(
      `${STUDENTS_BASE}?user_id=${userId}`,
      { method: "GET" },
      opts
    );
    return students && students.length > 0 ? students[0] : null;
  } catch {
    return null;
  }
}

export async function getLecturerByUserId(
  userId: string,
  opts: ApiOptions = {}
): Promise<Lecturer | null> {
  try {
    const lecturers = await apiFetch<Lecturer[]>(
      `/api/v1/lecturers?user_id=${userId}`,
      { method: "GET" },
      opts
    );
    return lecturers && lecturers.length > 0 ? lecturers[0] : null;
  } catch {
    return null;
  }
}
