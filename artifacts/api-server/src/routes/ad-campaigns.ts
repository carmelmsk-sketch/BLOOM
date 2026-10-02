import Router, { type IRouter } from "express";
import { requireAuth, sendSupabaseError, supabaseTable } from "../lib/supabase";

const router: IRouter = Router();
const MAX_META_BUDGET_CENTS = 5000;
const KKIAPAY_REQUIRED_HEADERS = [
  "x-kkiapay-api-key",
  "x-kkiapay-signature",
  "x-kkiapay-timestamp",
];

type Row = Record<string, unknown>;

function asRows<T extends Row>(data: unknown): T[] {
  return (Array.isArray(data) ? data : []) as T[];
}

function bodyRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

function parseBudgetCents(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }
  return null;
}

function normalizeCurrency(value: unknown): string {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "XOF";
  const allowed = [
    "XOF",
    "XAF",
    "CDF",
    "USD",
    "EUR",
    "GBP",
    "CAD",
    "AUD",
    "CHF",
    "MAD",
    "DZD",
    "TND",
    "NGN",
    "GHS",
    "KES",
    "ZAR",
  ];
  return allowed.includes(raw) ? raw : "XOF";
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isValidPlatform(value: unknown): string {
  const allowed = ["meta", "google", "tiktok", "other"];
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "meta";
  return allowed.includes(normalized) ? normalized : "meta";
}

function getHeaderValue(req: { headers: Record<string, string | string[] | undefined> }, name: string): string | undefined {
  const value = req.headers[name];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? undefined;
}

router.post("/ad-campaigns/suggest", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const body = bodyRecord(req.body);
  const name = optionalString(body.name);
  if (!name) {
    res.status(400).json({
      code: "INVALID_CAMPAIGN_NAME",
      message: "Le nom de la campagne est requis.",
    });
    return;
  }

  const objective = optionalString(body.objective) ?? "brand_awareness";
  const budgetCents = parseBudgetCents(body.budget_cents);
  if (budgetCents === null || budgetCents < 500 || budgetCents > MAX_META_BUDGET_CENTS) {
    res.status(400).json({
      code: "INVALID_BUDGET",
      message: `Le budget doit être compris entre 500 et ${MAX_META_BUDGET_CENTS} centimes (${normalizeCurrency(body.currency)}).`,
    });
    return;
  }

  const result = await supabaseTable<Row[]>(
    "ad_campaigns",
    "",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        owner_id: context.user.id,
        name,
        platform: isValidPlatform(body.platform),
        objective,
        budget_cents: budgetCents,
        currency: normalizeCurrency(body.currency),
        audience: body.audience ?? {},
        creative_url: optionalString(body.creative_url),
        notes: optionalString(body.notes) ?? "",
        status: "draft",
      }),
    },
    context.accessToken,
  );

  if (!result.ok) {
    sendSupabaseError(res, result);
    return;
  }

  const campaign = asRows<Row>(result.data)[0] ?? null;
  res.status(201).json({ campaign });
});

router.patch("/ad-campaigns/:id", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const id = encodeURIComponent(req.params.id);
  const body = bodyRecord(req.body);
  const allowed = [
    "name",
    "objective",
    "platform",
    "budget_cents",
    "currency",
    "audience",
    "creative_url",
    "notes",
    "status",
  ];

  const payload: Row = {};
  for (const key of allowed) {
    if (!(key in body)) continue;

    if (key === "budget_cents") {
      const parsed = parseBudgetCents(body[key]);
      if (parsed === null) {
        res.status(400).json({ code: "INVALID_BUDGET", message: "Le budget est invalide." });
        return;
      }
      payload[key] = parsed;
      continue;
    }

    if (key === "currency") {
      payload[key] = normalizeCurrency(body[key]);
      continue;
    }

    if (key === "platform") {
      payload[key] = isValidPlatform(body[key]);
      continue;
    }

    if (key === "status") {
      const status = typeof body[key] === "string" ? body[key].trim() : "";
      if (status && ["draft", "pending", "approved", "running", "paused", "rejected", "failed"].includes(status)) {
        payload[key] = status;
      }
      continue;
    }

    if (typeof body[key] === "string") {
      payload[key] = body[key];
    } else if (key === "audience" && body[key] && typeof body[key] === "object") {
      payload[key] = body[key];
    }
  }

  if (Object.keys(payload).length === 0) {
    res.status(400).json({ code: "EMPTY_UPDATE", message: "Aucune modification à enregistrer." });
    return;
  }

  const result = await supabaseTable<Row[]>(
    "ad_campaigns",
    `?id=eq.${id}&owner_id=eq.${encodeURIComponent(context.user.id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
    },
    context.accessToken,
  );

  if (!result.ok) {
    sendSupabaseError(res, result);
    return;
  }

  const campaign = asRows<Row>(result.data)[0] ?? null;
  res.json({ campaign });
});

router.post("/ad-campaigns/:id/pay-and-launch", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const id = encodeURIComponent(req.params.id);
  const ownerId = encodeURIComponent(context.user.id);
  const missingHeaders = KKIAPAY_REQUIRED_HEADERS.filter((headerName) => !getHeaderValue(req, headerName));

  if (missingHeaders.length > 0) {
    res.status(400).json({
      code: "KKIAPAY_HEADERS_MISSING",
      message: "Les en-têtes Kkiapay requis sont absents.",
      missing: missingHeaders,
    });
    return;
  }

  if (!process.env.KKIAPAY_API_KEY || !process.env.KKIAPAY_SECRET) {
    res.status(503).json({
      code: "KKIAPAY_NOT_CONFIGURED",
      message: "Le serveur Kkiapay n'est pas configuré pour cette instance.",
    });
    return;
  }

  const lookup = await supabaseTable<Row[]>(
    "ad_campaigns",
    `?id=eq.${id}&owner_id=eq.${ownerId}&select=*`,
    {},
    context.accessToken,
  );

  if (!lookup.ok) {
    sendSupabaseError(res, lookup);
    return;
  }

  const campaign = asRows<Row>(lookup.data)[0];
  if (!campaign) {
    res.status(404).json({ code: "CAMPAIGN_NOT_FOUND", message: "Campagne introuvable." });
    return;
  }

  const result = await supabaseTable<Row[]>(
    "ad_campaigns",
    `?id=eq.${id}&owner_id=eq.${ownerId}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "pending",
        payment_status: "pending",
        kkiapay_reference: `kkiapay-${Date.now()}`,
        launched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    },
    context.accessToken,
  );

  if (!result.ok) {
    sendSupabaseError(res, result);
    return;
  }

  res.json({ campaign: asRows<Row>(result.data)[0] ?? campaign, payment_status: "pending" });
});

router.post("/ad-campaigns/:id/approve", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const id = encodeURIComponent(req.params.id);
  const ownerId = encodeURIComponent(context.user.id);
  const lookup = await supabaseTable<Row[]>(
    "ad_campaigns",
    `?id=eq.${id}&owner_id=eq.${ownerId}&select=*`,
    {},
    context.accessToken,
  );

  if (!lookup.ok) {
    sendSupabaseError(res, lookup);
    return;
  }

  const campaign = asRows<Row>(lookup.data)[0];
  if (!campaign) {
    res.status(404).json({ code: "CAMPAIGN_NOT_FOUND", message: "Campagne introuvable." });
    return;
  }

  const metaAccessToken = process.env.META_ACCESS_TOKEN;
  if (!metaAccessToken) {
    res.status(424).json({
      code: "META_SECRETS_MISSING",
      message: "Les secrets Meta Graph API ne sont pas configurés pour lancer la campagne.",
    });
    return;
  }

  const response = await fetch("https://graph.facebook.com/v19.0/me/adaccounts", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${metaAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const details = await response.text();
    res.status(502).json({
      code: "META_GRAPH_API_ERROR",
      message: "L'appel Meta Graph API a échoué.",
      details: details.slice(0, 500),
    });
    return;
  }

  const result = await supabaseTable<Row[]>(
    "ad_campaigns",
    `?id=eq.${id}&owner_id=eq.${ownerId}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "approved",
        updated_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      }),
    },
    context.accessToken,
  );

  if (!result.ok) {
    sendSupabaseError(res, result);
    return;
  }

  res.json({ campaign: asRows<Row>(result.data)[0] ?? campaign, meta_status: "approved" });
});

router.post("/ad-campaigns/:id/pause", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const id = encodeURIComponent(req.params.id);
  const ownerId = encodeURIComponent(context.user.id);
  const result = await supabaseTable<Row[]>(
    "ad_campaigns",
    `?id=eq.${id}&owner_id=eq.${ownerId}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "paused",
        paused_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    },
    context.accessToken,
  );

  if (!result.ok) {
    sendSupabaseError(res, result);
    return;
  }

  const campaign = asRows<Row>(result.data)[0] ?? null;
  res.json({ campaign, status: "paused" });
});

export default router;

