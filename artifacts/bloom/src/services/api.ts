export type ApiError = Error & { status?: number; code?: string };

export type SessionUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type Profile = {
  id: string;
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  domain?: string | null;
  level?: string | null;
  onboarding_goal?: string | null;
  onboarding_completed?: boolean;
  role?: 'user' | 'admin';
};

export type SessionResponse = {
  authenticated: boolean;
  user: SessionUser | null;
};

export type ProfileResponse = {
  user: SessionUser;
  profile: Profile | null;
  schemaReady: boolean;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    let payload: { message?: string; code?: string } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      // The server may return an empty error response.
    }
    const error = new Error(payload.message ?? 'Une erreur est survenue.') as ApiError;
    error.status = response.status;
    error.code = payload.code;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiGet<T>(path: string) {
  return request<T>(path);
}

export function apiPost<T>(path: string, body?: unknown) {
  return request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
}

export function apiPatch<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string) {
  return request<T>(path, { method: 'DELETE' });
}

export { request as apiRequest };