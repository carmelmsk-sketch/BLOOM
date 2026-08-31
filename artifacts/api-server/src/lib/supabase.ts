import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

const SESSION_COOKIE = "bloom_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type StoredSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export type AuthContext = {
  user: SupabaseUser;
  accessToken: string;
  session: StoredSession;
};

export type SupabaseResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: { message?: string; code?: string; details?: string; hint?: string };
};

function requiredEnv(name: "SUPABASE_URL" | "SUPABASE_ANON_KEY" | "SESSION_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be configured`);
  }
  return value;
}

function sign(value: string) {
  return createHmac("sha256", requiredEnv("SESSION_SECRET"))
    .update(value)
    .digest("base64url");
}

function encodeSession(session: StoredSession) {
  const encoded = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function decodeSession(value: string | undefined): StoredSession | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (
    expected.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as StoredSession;
    if (
      typeof parsed.access_token !== "string" ||
      typeof parsed.refresh_token !== "string" ||
      typeof parsed.expires_at !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, session: StoredSession) {
  res.cookie(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
}

async function supabaseFetch<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<SupabaseResult<T>> {
  const url = `${requiredEnv("SUPABASE_URL").replace(/\/$/, "")}${path}`;
  const headers = new Headers(init.headers);
  headers.set("apikey", requiredEnv("SUPABASE_ANON_KEY"));
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  headers.set("Accept", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  try {
    const response = await fetch(url, { ...init, headers });
    const text = await response.text();
    let data: unknown;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!response.ok) {
      const error = typeof data === "object" && data !== null ? data : { message: String(data ?? "") };
      return { ok: false, status: response.status, error: error as SupabaseResult<T>["error"] };
    }
    return { ok: true, status: response.status, data: data as T };
  } catch (error) {
    return {
      ok: false,
      status: 503,
      error: { message: error instanceof Error ? error.message : "Supabase est indisponible." },
    };
  }
}

export function supabaseAuth<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
) {
  return supabaseFetch<T>(path, init, accessToken);
}

export function supabaseTable<T>(
  table: string,
  query = "",
  init: RequestInit = {},
  accessToken?: string,
) {
  return supabaseFetch<T>(`/rest/v1/${table}${query}`, init, accessToken);
}

export async function getAuthContext(req: Request, res: Response): Promise<AuthContext | null> {
  const raw = req.cookies?.[SESSION_COOKIE] as string | undefined;
  let session = decodeSession(raw);
  if (!session) return null;

  if (session.expires_at - Math.floor(Date.now() / 1000) < 60) {
    const refreshed = await supabaseAuth<{
      access_token: string;
      refresh_token: string;
      expires_in?: number;
    }>("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (!refreshed.ok || !refreshed.data) {
      clearSessionCookie(res);
      return null;
    }
    session = {
      access_token: refreshed.data.access_token,
      refresh_token: refreshed.data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (refreshed.data.expires_in ?? 3600),
    };
    setSessionCookie(res, session);
  }

  const user = await supabaseAuth<SupabaseUser>("/auth/v1/user", {}, session.access_token);
  if (!user.ok || !user.data) {
    clearSessionCookie(res);
    return null;
  }
  return { user: user.data, accessToken: session.access_token, session };
}

export async function requireAuth(req: Request, res: Response) {
  const context = await getAuthContext(req, res);
  if (!context) {
    res.status(401).json({ code: "AUTH_REQUIRED", message: "Connecte-toi pour continuer." });
    return null;
  }
  return context;
}

export function schemaUnavailable(result: SupabaseResult<unknown>) {
  const message = result.error?.message ?? "";
  return (
    result.status === 404 &&
    (result.error?.code === "PGRST205" || message.includes("schema cache") || message.includes("relation"))
  );
}

export function sendSupabaseError(res: Response, result: SupabaseResult<unknown>) {
  if (schemaUnavailable(result)) {
    res.status(503).json({
      code: "SCHEMA_NOT_READY",
      message: "Le schéma BLOOM n’est pas encore appliqué dans Supabase.",
    });
    return;
  }
  res.status(result.status >= 500 ? 502 : result.status).json({
    code: result.error?.code ?? "SUPABASE_ERROR",
    message: result.error?.message ?? "Supabase n’a pas pu répondre.",
  });
}