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
    const firstName =
      typeof req.body?.firstName === "string"
        ? req.body.firstName.trim()
        : "";

    const lastName =
      typeof req.body?.lastName === "string"
        ? req.body.lastName.trim()
        : "";

    const displayName =
      typeof req.body?.displayName === "string"
        ? req.body.displayName.trim()
        : `${firstName} ${lastName}`.trim();

    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    const validPassword =
      password.length >= 9 &&
      /^[A-Z]/.test(password) &&
      /[A-Za-z]/.test(password) &&
      /\d/.test(password);

    if (
      !firstName ||
      firstName.length < 2 ||
      !lastName ||
      lastName.length < 2 ||
      !email ||
      !displayName ||
      !validPassword
    ) {
      res.status(400).json({
        code: "INVALID_SIGNUP",
        message:
          "Le prénom et le nom sont requis. Le mot de passe doit contenir au moins 9 caractères, commencer par une majuscule et contenir au moins une lettre et un chiffre.",
      });
      return;
    }

    const result = await supabaseAuth<{
      access_token: string | null;
      refresh_token: string | null;
      expires_in?: number;
      user: {
        id: string;
        email: string;
        email_confirmed_at?: string | null;
        user_metadata: Record<string, unknown>;
      } | null;
    }>("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        data: {
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
        },
      }),
    });

    if (!result.ok || !result.data) {
      sendSupabaseError(res, result);
      return;
    }

    const session = result.data;

    /*
     * Avec Confirm Email activé, Supabase ne doit pas fournir
     * de session avant que l'utilisateur confirme son adresse.
     */
    if (session.access_token && session.refresh_token) {
      setSessionCookie(res, {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at:
          Math.floor(Date.now() / 1000) +
          (session.expires_in ?? 3600),
      });
    }

    const authenticated = Boolean(
      session.access_token && session.refresh_token
    );

    res.status(201).json({
      authenticated,
      requiresEmailConfirmation: !authenticated,
      user: session.user ?? null,
    });
  } catch (error) {
    res.status(502).json({
      code: "AUTH_PROVIDER_UNAVAILABLE",
      message:
        error instanceof Error
          ? error.message
          : "Le service d'authentification est indisponible.",
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
