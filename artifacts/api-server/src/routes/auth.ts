import { Router, type IRouter } from "express";
import {
  clearSessionCookie,
  getAuthContext,
  sendSupabaseError,
  setSessionCookie,
  supabaseAuth,
} from "../lib/supabase";

const router: IRouter = Router();

router.post("/signup", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";

    if (!email || !password || password.length < 8 || displayName.length < 2) {
      res.status(400).json({
        code: "INVALID_SIGNUP",
        message: "Un email, un nom et un mot de passe de 8 caractères minimum sont requis.",
      });
      return;
    }

    const result = await supabaseAuth<{
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      user?: { id: string; email?: string; user_metadata?: Record<string, unknown> };
    }>("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, data: { display_name: displayName } }),
    });

    if (!result.ok || !result.data) {
      sendSupabaseError(res, result);
      return;
    }

    const session = result.data;
    if (session.access_token && session.refresh_token) {
      setSessionCookie(res, {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600),
      });
    }
    res.status(201).json({
      authenticated: Boolean(session.access_token && session.refresh_token),
      requiresEmailConfirmation: !session.access_token,
      user: session.user ?? null,
    });
  } catch (error) {
    res.status(502).json({
      code: "AUTH_PROVIDER_UNAVAILABLE",
      message: error instanceof Error ? error.message : "Le service d’authentification est indisponible.",
    });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
      res.status(400).json({ code: "INVALID_SIGNIN", message: "L’email et le mot de passe sont requis." });
      return;
    }

    const result = await supabaseAuth<{
      access_token: string;
      refresh_token: string;
      expires_in?: number;
      user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
    }>("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!result.ok || !result.data) {
      sendSupabaseError(res, result);
      return;
    }

    setSessionCookie(res, {
      access_token: result.data.access_token,
      refresh_token: result.data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (result.data.expires_in ?? 3600),
    });
    res.json({ authenticated: true, user: result.data.user });
  } catch (error) {
    res.status(502).json({
      code: "AUTH_PROVIDER_UNAVAILABLE",
      message: error instanceof Error ? error.message : "Le service d’authentification est indisponible.",
    });
  }
});

router.get("/session", async (req, res) => {
  const context = await getAuthContext(req, res);
  if (!context) {
    res.json({ authenticated: false, user: null });
    return;
  }
  res.json({ authenticated: true, user: context.user });
});

router.get("/me", async (req, res) => {
  const context = await getAuthContext(req, res);
  if (!context) {
    res.status(401).json({ code: "AUTH_REQUIRED", message: "Connecte-toi pour continuer." });
    return;
  }
  res.json({ user: context.user });
});

router.post("/signout", async (req, res) => {
  const context = await getAuthContext(req, res);
  if (context) {
    await supabaseAuth("/auth/v1/logout", { method: "POST" }, context.accessToken);
  }
  clearSessionCookie(res);
  res.status(204).send();
});

// Keep the old endpoint names unavailable rather than reintroducing local/mock auth.
router.post("/register", (_req, res) => {
  res.status(410).json({
    code: "AUTH_ENDPOINT_RETIRED",
    message: "Utilise /api/auth/signup.",
  });
});

router.post("/login", (_req, res) => {
  res.status(410).json({
    code: "AUTH_ENDPOINT_RETIRED",
    message: "Utilise /api/auth/signin.",
  });
});

export default router;
