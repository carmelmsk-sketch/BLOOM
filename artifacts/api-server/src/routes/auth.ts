import { Router, type IRouter } from "express";
import {
  clearSessionCookie,
  getAuthContext,
  setSessionCookie,
  supabaseAuth,
} from "../lib/supabase";

const router: IRouter = Router();

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
};

function authSession(data: AuthResponse) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
  };
}

router.post("/auth/signup", async (req, res) => {
  const { email, password, displayName } = req.body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ code: "INVALID_AUTH_INPUT", message: "Email et mot de passe de 8 caractères minimum requis." });
    return;
  }
  const result = await supabaseAuth<AuthResponse>("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      data: typeof displayName === "string" ? { display_name: displayName.trim() } : undefined,
    }),
  });
  if (!result.ok || !result.data) {
    res.status(result.status).json({
      code: result.error?.code ?? "SIGNUP_FAILED",
      message: result.error?.message ?? "Impossible de créer ce compte.",
    });
    return;
  }
  if (result.data.access_token && result.data.refresh_token) {
    setSessionCookie(res, authSession(result.data));
  }
  res.status(201).json({
    user: result.data.user,
    authenticated: Boolean(result.data.access_token),
    requiresEmailConfirmation: !result.data.access_token,
  });
});

router.post("/auth/signin", async (req, res) => {
  const { email, password } = req.body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ code: "INVALID_AUTH_INPUT", message: "Email et mot de passe requis." });
    return;
  }
  const result = await supabaseAuth<AuthResponse>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  if (!result.ok || !result.data) {
    res.status(result.status).json({
      code: result.error?.code ?? "SIGNIN_FAILED",
      message: result.error?.message ?? "Email ou mot de passe incorrect.",
    });
    return;
  }
  setSessionCookie(res, authSession(result.data));
  res.json({ user: result.data.user, authenticated: true });
});

router.post("/auth/signout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).send();
});

router.get("/auth/session", async (req, res) => {
  const context = await getAuthContext(req, res);
  if (!context) {
    res.json({ authenticated: false, user: null, profile: null });
    return;
  }
  res.json({ authenticated: true, user: context.user });
});

export default router;