import type {
  ApiError,
  ApiSuccess,
  Student,
} from "@/types/students";
import type { AchievementListItem } from "@/types/achievement";

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

const STUDENTS_BASE = "/api/v1/students";

export async function getAllStudents(
  opts: ApiOptions = {}
): Promise<Student[]> {
  return apiFetch<Student[]>(
    `${STUDENTS_BASE}`,
    { method: "GET" },
    opts
  );
}

export async function getStudentById(
  id: string,
  opts: ApiOptions = {}
): Promise<Student> {
  return apiFetch<Student>(
    `${STUDENTS_BASE}/${id}`,
    { method: "GET" },
    opts
  );
}

export async function getStudentAchievements(
  id: string,
  page?: number,
  limit?: number,
  opts: ApiOptions = {}
): Promise<{ data: AchievementListItem[]; pagination?: { page: number; limit: number; total: number; total_pages: number } }> {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  
  const queryString = params.toString();
  const url = `${STUDENTS_BASE}/${id}/achievements${queryString ? `?${queryString}` : ""}`;
  
  return apiFetch<{ data: AchievementListItem[]; pagination?: { page: number; limit: number; total: number; total_pages: number } }>(
    url,
    { method: "GET" },
    opts
  );
}

export async function updateStudentAdvisor(
  id: string,
  advisorId: string,
  opts: ApiOptions = {}
): Promise<void> {
  await apiFetch<unknown>(
    `${STUDENTS_BASE}/${id}/advisor`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ advisor_id: advisorId }),
    },
    opts
  );
}
