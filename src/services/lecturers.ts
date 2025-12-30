import type {
  ApiError,
  ApiSuccess,
  Lecturer,
} from "@/types/lecturers";
import type { Student } from "@/types/students";

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

const LECTURERS_BASE = "/api/v1/lecturers";

export async function getAllLecturers(
  opts: ApiOptions = {}
): Promise<Lecturer[]> {
  return apiFetch<Lecturer[]>(
    `${LECTURERS_BASE}`,
    { method: "GET" },
    opts
  );
}

export async function getLecturerAdvisees(
  id: string,
  opts: ApiOptions = {}
): Promise<Student[]> {
  return apiFetch<Student[]>(
    `${LECTURERS_BASE}/${id}/advisees`,
    { method: "GET" },
    opts
  );
}
