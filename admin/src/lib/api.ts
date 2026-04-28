const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

let accessToken: string | null = null;
export function setToken(t: string | null) {
  accessToken = t;
  if (typeof window !== 'undefined') {
    if (t) localStorage.setItem('vt_admin_token', t);
    else localStorage.removeItem('vt_admin_token');
  }
}
export function getToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') accessToken = localStorage.getItem('vt_admin_token');
  return accessToken;
}

interface ApiResponse<T> { ok: boolean; data?: T; error?: { code: string; message: string } }

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    credentials: 'include',
  });
  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (!res.ok || json.ok === false) {
    throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
