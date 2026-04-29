import type { ApiError } from '@/types/api';

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
export const API_BASE = RAW_BASE.replace(/\/$/, '');

const REFRESH_KEY = 'sb_refresh_token';

let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;
const subscribers = new Set<() => void>();

export const tokenStore = {
  getAccess: () => accessToken,
  setAccess: (t: string | null) => {
    accessToken = t;
    subscribers.forEach((fn) => fn());
  },
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (t: string | null) => {
    if (t) localStorage.setItem(REFRESH_KEY, t);
    else localStorage.removeItem(REFRESH_KEY);
  },
  subscribe: (fn: () => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
  clear: () => {
    tokenStore.setAccess(null);
    tokenStore.setRefresh(null);
  },
};

export class HttpError extends Error {
  status: number;
  payload: ApiError | undefined;
  constructor(status: number, message: string, payload?: ApiError) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
}

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshing) return refreshing;
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;
  refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return null;
      }
      const json = (await res.json()) as { data: { accessToken: string; refreshToken: string } };
      tokenStore.setAccess(json.data.accessToken);
      tokenStore.setRefresh(json.data.refreshToken);
      return json.data.accessToken;
    } catch {
      tokenStore.clear();
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
};

export const apiRequest = async <T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> => {
  const { body, auth = true, isFormData = false, headers, ...rest } = opts;

  const buildHeaders = (token: string | null): HeadersInit => {
    const h: Record<string, string> = { Accept: 'application/json', ...(headers as Record<string, string> | undefined) };
    if (!isFormData && body !== undefined) h['Content-Type'] = 'application/json';
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const send = async (token: string | null): Promise<Response> =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: buildHeaders(token),
      body:
        body === undefined
          ? undefined
          : isFormData
          ? (body as BodyInit)
          : JSON.stringify(body),
    });

  let res = await send(auth ? tokenStore.getAccess() : null);

  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) res = await send(newToken);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    throw new HttpError(res.status, `Invalid JSON response (${res.status})`);
  }

  if (!res.ok) {
    const err = json as ApiError;
    throw new HttpError(res.status, err?.message ?? `Request failed (${res.status})`, err);
  }
  const wrapped = json as { data?: T };
  return (wrapped?.data ?? (json as T));
};

export const apiPaginated = async <T>(
  path: string,
  opts: RequestOptions = {},
): Promise<{ data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
  const { body, auth = true, headers, ...rest } = opts;
  const token = auth ? tokenStore.getAccess() : null;
  const h: Record<string, string> = { Accept: 'application/json', ...(headers as Record<string, string> | undefined) };
  if (body !== undefined) h['Content-Type'] = 'application/json';
  if (token) h['Authorization'] = `Bearer ${token}`;
  let res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      h['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...rest, headers: h });
    }
  }
  const json = await res.json();
  if (!res.ok) throw new HttpError(res.status, json?.message ?? 'Request failed', json);
  return { data: json.data, meta: json.meta };
};
