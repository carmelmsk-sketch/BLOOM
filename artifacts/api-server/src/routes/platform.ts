import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  requireAuth,
  sendSupabaseError,
  schemaUnavailable,
  supabaseTable,
} from "../lib/supabase";

const router: IRouter = Router();

type Row = Record<string, unknown>;

const PUBLIC_PRODUCT_COLUMNS = "id,slug,title,description,product_type,category,price_cents,promo_price_cents,currency,cover_url,status,shop_id,created_at";

function asRows<T extends Row>(data: unknown) {
  return (Array.isArray(data) ? data : []) as T[];
}

async function currentProfile(userId: string, accessToken: string) {
  return supabaseTable<Row[]>(
    "profiles",
    `?id=eq.${encodeURIComponent(userId)}&select=*`,
    {},
    accessToken,
  );
}

function bodyRecord(body: unknown) {
  return body && typeof body === "object" ? (body as Row) : {};
}

router.get("/profile", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const result = await currentProfile(context.user.id, context.accessToken);
  if (!result.ok) {
    if (schemaUnavailable(result)) {
      res.json({ user: context.user, profile: null, schemaReady: false });
      return;
    }
    sendSupabaseError(res, result);
    return;
  }
  res.json({ user: context.user, profile: asRows(result.data)[0] ?? null, schemaReady: true });
});

router.patch("/profile", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const body = bodyRecord(req.body);
  const allowed = ["display_name", "username", "avatar_url", "bio", "domain", "level", "onboarding_goal", "onboarding_completed"];
  const payload: Row = { id: context.user.id };
  for (const key of allowed) {
    if (key in body && (typeof body[key] === "string" || typeof body[key] === "boolean" || body[key] === null)) {
      payload[key] = body[key];
    }
  }
  payload.updated_at = new Date().toISOString();
  const result = await supabaseTable<Row[]>(
    "profiles",
    "?on_conflict=id",
    { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(payload) },
    context.accessToken,
  );
  if (!result.ok) {
    sendSupabaseError(res, result);
    return;
  }
  res.json({ profile: asRows(result.data)[0] ?? payload });
});

router.get("/shops/mine", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const result = await supabaseTable<Row[]>("shops", `?owner_id=eq.${encodeURIComponent(context.user.id)}&select=*&order=created_at.desc`, {}, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ shops: asRows(result.data) });
});

router.post("/shops", async (req, res) => {
  const context = await requireAuth(req, res)
  if (!context) return;

  const body = bodyRecord(req.body)

  if (!body) {
    res.status(400).json({
      code: "INVALID_SHOP",
      message: "Les données de la boutique sont invalides.",
    })
    return
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : ""
  const description =
    typeof body.description === "string"
      ? body.description.trim()
      : ""

  if (!name || !slug) {
    res.status(400).json({
      code: "INVALID_SHOP",
      message: "Le nom et le slug de la boutique sont requis.",
    })
    return
  }

  if (name.length < 2 || name.length > 80) {
    res.status(400).json({
      code: "INVALID_SHOP_NAME",
      message: "Le nom de la boutique doit contenir entre 2 et 80 caractères.",
    })
    return
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    res.status(400).json({
      code: "INVALID_SHOP_SLUG",
      message: "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets.",
    })
    return
  }

  if (slug.length < 2 || slug.length > 80) {
    res.status(400).json({
      code: "INVALID_SHOP_SLUG",
      message: "Le slug doit contenir entre 2 et 80 caractères.",
    })
    return
  }

  if (description.length > 2000) {
    res.status(400).json({
      code: "INVALID_SHOP_DESCRIPTION",
      message: "La description de la boutique ne peut pas dépasser 2000 caractères.",
    })
    return
  }

  const result = await supabaseTable<Row[]>("shops", "", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      owner_id: context.user.id,
      name,
      slug,
      description: description || null,
    }),
  }, context.accessToken)

  if (!result.ok) {
    sendSupabaseError(res, result)
    return
  }

  res.status(201).json({
    shop: asRows(result.data)[0] ?? null,
  })
});
router.patch("/shops/:id", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const body = bodyRecord(req.body);
  const payload = Object.fromEntries(["name", "slug", "description", "logo_url"].filter((key) => typeof body[key] === "string").map((key) => [key, body[key]]));
  const result = await supabaseTable<Row[]>("shops", `?id=eq.${encodeURIComponent(req.params.id)}&owner_id=eq.${encodeURIComponent(context.user.id)}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
  }, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  const shop = asRows(result.data)[0];
  if (!shop) { res.status(404).json({ code: "SHOP_NOT_FOUND", message: "Boutique introuvable." }); return; }
  res.json({ shop });
});

router.get("/shops/:slug", async (req, res) => {
  const result = await supabaseTable<Row[]>("shops", `?slug=eq.${encodeURIComponent(req.params.slug)}&select=*`, {});
  if (!result.ok) { sendSupabaseError(res, result); return; }
  const shop = asRows(result.data)[0];
  if (!shop) { res.status(404).json({ code: "SHOP_NOT_FOUND", message: "Boutique introuvable." }); return; }
  res.json({ shop });
});

router.get("/products", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category : "";
  const mine = req.query.mine === "true";
  const context = mine ? await requireAuth(req, res) : null;
  if (mine && !context) return;
  const filters = [
    mine ? `owner_id=eq.${encodeURIComponent(context!.user.id)}` : "status=eq.published",
    search ? `or=(title.ilike.*${encodeURIComponent(search)}*,description.ilike.*${encodeURIComponent(search)}*)` : "",
    category ? `category=eq.${encodeURIComponent(category)}` : "",
  ].filter(Boolean).join("&");
  const result = await supabaseTable<Row[]>("products", `?${filters}&select=${mine ? "*" : PUBLIC_PRODUCT_COLUMNS},shops(name,slug)&order=created_at.desc`, {}, context?.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ products: asRows(result.data), demo: false });
});

router.get("/products/:slug", async (req, res) => {
  const result = await supabaseTable<Row[]>("products", `?slug=eq.${encodeURIComponent(req.params.slug)}&status=eq.published&select=${PUBLIC_PRODUCT_COLUMNS},shops(name,slug)`, {});
  if (!result.ok) { sendSupabaseError(res, result); return; }
  const product = asRows(result.data)[0];
  if (!product) { res.status(404).json({ code: "PRODUCT_NOT_FOUND", message: "Produit introuvable." }); return; }
  res.json({ product });
});

router.post("/products", async (req, res) => {
  const context = await requireAuth(req, res)
  if (!context) return

  const body = bodyRecord(req.body)

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const description = typeof body.description === "string" ? body.description.trim() : ""
  const productType = typeof body.product_type === "string" ? body.product_type.trim() : ""
  const category = typeof body.category === "string" ? body.category.trim() : "Création de contenu"
  const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "XOF"

  const allowedTypes = ["ebook", "formation", "pack", "template", "guide", "other"]
  const allowedCurrencies = [
    "XOF", "XAF", "CDF", "USD", "EUR", "GBP", "CAD", "AUD",
    "CHF", "MAD", "DZD", "TND", "NGN", "GHS", "KES", "ZAR"
  ]

  if (!title || !productType || typeof body.price_cents !== "number") {
    res.status(400).json({
      code: "INVALID_PRODUCT",
      message: "Le titre, le type de produit et le prix normal sont requis.",
    })
    return
  }

  if (title.length < 3 || title.length > 150) {
    res.status(400).json({
      code: "INVALID_PRODUCT_TITLE",
      message: "Le titre doit contenir entre 3 et 150 caractères.",
    })
    return
  }

  if (!allowedTypes.includes(productType)) {
    res.status(400).json({
      code: "INVALID_PRODUCT_TYPE",
      message: "Le type de produit sélectionné est invalide.",
    })
    return
  }

  if (description.length < 20 || description.length > 10000) {
    res.status(400).json({
      code: "INVALID_PRODUCT_DESCRIPTION",
      message: "La description doit contenir entre 20 et 10000 caractères.",
    })
    return
  }

  if (!allowedCurrencies.includes(currency)) {
    res.status(400).json({
      code: "INVALID_CURRENCY",
      message: "La devise sélectionnée n'est pas disponible.",
    })
    return
  }

  const priceCents = Math.round(body.price_cents)

  if (!Number.isFinite(priceCents) || priceCents < 55000) {
    res.status(400).json({
      code: "INVALID_PRODUCT_PRICE",
      message: "Le prix normal doit être d'au moins 550.",
    })
    return
  }

  let promoPriceCents: number | null = null

  if (body.promo_price_cents !== undefined && body.promo_price_cents !== null && body.promo_price_cents !== "") {
    if (typeof body.promo_price_cents !== "number" || !Number.isFinite(body.promo_price_cents)) {
      res.status(400).json({
        code: "INVALID_PROMO_PRICE",
        message: "Le prix promotionnel est invalide.",
      })
      return
    }

    promoPriceCents = Math.round(body.promo_price_cents)

    if (promoPriceCents < 55000 || promoPriceCents >= priceCents) {
      res.status(400).json({
        code: "INVALID_PROMO_PRICE",
        message: "Le prix promotionnel doit être d'au moins 550 et inférieur au prix normal.",
      })
      return
    }
  }

  const slug = typeof body.slug === "string" && body.slug.trim()
    ? body.slug.trim().toLowerCase()
    : `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}-${Math.random().toString(36).slice(2, 8)}`

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
    res.status(400).json({
      code: "INVALID_PRODUCT_SLUG",
      message: "Le slug du produit est invalide.",
    })
    return
  }

  const shopId = typeof body.shop_id === "string" && body.shop_id.trim()
    ? body.shop_id.trim()
    : null

  if (shopId) {
    const shopResult = await supabaseTable<Row[]>(
      "shops",
      `?id=eq.${encodeURIComponent(shopId)}&owner_id=eq.${encodeURIComponent(context.user.id)}&select=id`,
      {},
      context.accessToken
    )

    if (!shopResult.ok) {
      sendSupabaseError(res, shopResult)
      return
    }

    if (asRows(shopResult.data).length === 0) {
      res.status(400).json({
        code: "INVALID_SHOP",
        message: "La boutique sélectionnée n'existe pas ou ne t'appartient pas.",
      })
      return
    }
  }

  const result = await supabaseTable<Row[]>("products", "", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      owner_id: context.user.id,
      shop_id: shopId,
      slug,
      title,
      description,
      product_type: productType,
      category,
      price_cents: priceCents,
      promo_price_cents: promoPriceCents,
      currency,
      cover_url: typeof body.cover_url === "string" ? body.cover_url.trim() || null : null,
      file_path: typeof body.file_path === "string" ? body.file_path.trim() || null : null,
      status: "draft",
    }),
  }, context.accessToken)

  if (!result.ok) {
    sendSupabaseError(res, result)
    return
  }

  res.status(201).json({
    product: asRows(result.data)[0] ?? null,
  })
})

router.patch("/products/:id", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const body = bodyRecord(req.body);
  const allowed = ["title", "description", "product_type", "category", "price_cents", "promo_price_cents", "currency", "cover_url", "shop_id"];
  const payload = Object.fromEntries(allowed.filter((key) => key in body).map((key) => [key, body[key]]));

  if (Object.keys(payload).length === 0) {
    res.status(400).json({ code: "EMPTY_UPDATE", message: "Aucune modification à enregistrer." });
    return;
  }

  const shopId = payload.shop_id;
  if (shopId !== undefined && shopId !== null) {
    if (typeof shopId !== "string" || !shopId.trim()) {
      res.status(400).json({ code: "INVALID_SHOP", message: "La boutique sélectionnée est invalide." });
      return;
    }
    const shopResult = await supabaseTable<Row[]>("shops", `?id=eq.${encodeURIComponent(shopId)}&owner_id=eq.${encodeURIComponent(context.user.id)}&select=id`, {}, context.accessToken);
    if (!shopResult.ok) { sendSupabaseError(res, shopResult); return; }
    if (asRows(shopResult.data).length === 0) {
      res.status(400).json({ code: "INVALID_SHOP", message: "La boutique sélectionnée n'existe pas ou ne t'appartient pas." });
      return;
    }
  }

  const result = await supabaseTable<Row[]>("products", `?id=eq.${encodeURIComponent(req.params.id)}&owner_id=eq.${encodeURIComponent(context.user.id)}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
  }, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  const product = asRows(result.data)[0];
  if (!product) { res.status(404).json({ code: "PRODUCT_NOT_FOUND", message: "Produit introuvable." }); return; }
  res.json({ product });
});

router.post("/products/:id/publish", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const id = encodeURIComponent(req.params.id);
  const owner = encodeURIComponent(context.user.id);

  const found = await supabaseTable<Row[]>("products", `?id=eq.${id}&owner_id=eq.${owner}&select=id,title,description,shop_id`, {}, context.accessToken);
  if (!found.ok) { sendSupabaseError(res, found); return; }
  const product = asRows(found.data)[0];
  if (!product) { res.status(404).json({ code: "PRODUCT_NOT_FOUND", message: "Produit introuvable." }); return; }

  const missing: string[] = [];
  if (typeof product.title !== "string" || product.title.trim().length < 3) missing.push("title");
  if (typeof product.description !== "string" || product.description.trim().length < 20) missing.push("description");
  if (!product.shop_id) missing.push("shop_id");
  if (missing.length > 0) {
    res.status(422).json({ code: "PRODUCT_INCOMPLETE", message: "Complète ton produit avant de le publier.", missing });
    return;
  }

  const result = await supabaseTable<Row[]>("products", `?id=eq.${id}&owner_id=eq.${owner}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "published", updated_at: new Date().toISOString() }),
  }, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ product: asRows(result.data)[0] ?? null });
});

router.get("/favorites", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const result = await supabaseTable<Row[]>("favorites", `?user_id=eq.${encodeURIComponent(context.user.id)}&select=*,products(*)&order=created_at.desc`, {}, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ favorites: asRows(result.data) });
});

router.post("/favorites/:productId", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const existing = await supabaseTable<Row[]>("favorites", `?user_id=eq.${encodeURIComponent(context.user.id)}&product_id=eq.${encodeURIComponent(req.params.productId)}&select=*`, {}, context.accessToken);
  if (!existing.ok) { sendSupabaseError(res, existing); return; }
  if (asRows(existing.data).length) {
    const removed = await supabaseTable("favorites", `?user_id=eq.${encodeURIComponent(context.user.id)}&product_id=eq.${encodeURIComponent(req.params.productId)}`, { method: "DELETE" }, context.accessToken);
    if (!removed.ok) { sendSupabaseError(res, removed); return; }
    res.json({ favorited: false });
    return;
  }
  const added = await supabaseTable("favorites", "", { method: "POST", body: JSON.stringify({ user_id: context.user.id, product_id: req.params.productId }) }, context.accessToken);
  if (!added.ok) { sendSupabaseError(res, added); return; }
  res.status(201).json({ favorited: true });
});

router.get("/orders/mine", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const result = await supabaseTable<Row[]>("orders", `?buyer_id=eq.${encodeURIComponent(context.user.id)}&select=*,order_items(*,products(*))&order=created_at.desc`, {}, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ orders: asRows(result.data) });
});

router.post("/checkout", async (_req, res) => {
  res.status(501).json({
    code: "PAYMENT_PROVIDER_NOT_CONFIGURED",
    message: "Le checkout est prêt, mais aucun fournisseur de paiement n’est connecté. Aucun paiement n’a été simulé.",
    providers: ["mobile_money", "card"],
  });
});

router.get("/dashboard/summary", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const [products, shops, sales] = await Promise.all([
    supabaseTable<Row[]>("products", `?owner_id=eq.${encodeURIComponent(context.user.id)}&select=id,status`, {}, context.accessToken),
    supabaseTable<Row[]>("shops", `?owner_id=eq.${encodeURIComponent(context.user.id)}&select=id`, {}, context.accessToken),
    supabaseTable<Row[]>("order_items", `?seller_id=eq.${encodeURIComponent(context.user.id)}&select=unit_amount_cents,orders(status)`, {}, context.accessToken),
  ]);
  const failed = [products, shops, sales].find((result) => !result.ok);
  if (failed) { sendSupabaseError(res, failed); return; }
  const paidSales = asRows(sales.data).filter((sale) => {
    const order = sale.orders;
    return Array.isArray(order) ? order[0]?.status === "paid" : (order as Row | null)?.status === "paid";
  });
  const revenue = paidSales.reduce((sum, sale) => sum + (typeof sale.unit_amount_cents === "number" ? sale.unit_amount_cents : 0), 0);
  res.json({
    summary: {
      revenue_cents: revenue,
      sales_count: paidSales.length,
      orders_count: new Set(paidSales.map((sale) => String(sale.orders))).size,
      products_count: asRows(products.data).length,
      shops_count: asRows(shops.data).length,
      wallet_status: "not_configured",
    },
  });
});

router.post("/coach/conversations", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const body = bodyRecord(req.body);
  const result = await supabaseTable<Row[]>("coach_conversations", "", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ user_id: context.user.id, title: typeof body.title === "string" ? body.title : "Nouvelle conversation" }) }, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.status(201).json({ conversation: asRows(result.data)[0] ?? null, ai_status: "not_configured" });
});

router.post("/coach/conversations/:id/messages", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const body = bodyRecord(req.body);
  if (typeof body.content !== "string" || !body.content.trim()) { res.status(400).json({ code: "INVALID_MESSAGE", message: "Le message ne peut pas être vide." }); return; }
  const result = await supabaseTable<Row[]>("coach_messages", "", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ conversation_id: req.params.id, user_id: context.user.id, role: "user", content: body.content.trim() }) }, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.status(201).json({ message: asRows(result.data)[0] ?? null, ai_status: "not_configured", response: null });
});

router.get("/academy/courses", async (_req, res) => {
  const result = await supabaseTable<Row[]>("courses", "?status=eq.published&select=*,lessons(*)&order=created_at.desc");
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ courses: asRows(result.data) });
});

router.post("/academy/lessons/:id/progress", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const body = bodyRecord(req.body);
  const result = await supabaseTable<Row[]>("lesson_progress", "?on_conflict=user_id,lesson_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ user_id: context.user.id, lesson_id: req.params.id, completed: body.completed === true, progress_percent: typeof body.progress_percent === "number" ? Math.max(0, Math.min(100, Math.round(body.progress_percent))) : 0 }) }, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ progress: asRows(result.data)[0] ?? null });
});

router.get("/notifications", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const result = await supabaseTable<Row[]>("notifications", `?user_id=eq.${encodeURIComponent(context.user.id)}&select=*&order=created_at.desc&limit=50`, {}, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ notifications: asRows(result.data) });
});

router.get("/activity", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const result = await supabaseTable<Row[]>("activity_events", `?user_id=eq.${encodeURIComponent(context.user.id)}&select=*&order=created_at.desc&limit=50`, {}, context.accessToken);
  if (!result.ok) { sendSupabaseError(res, result); return; }
  res.json({ activity: asRows(result.data) });
});

router.get("/admin/overview", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;
  const profile = await currentProfile(context.user.id, context.accessToken);
  if (!profile.ok) { sendSupabaseError(res, profile); return; }
  const role = asRows(profile.data)[0]?.role;
  if (role !== "admin") { res.status(403).json({ code: "ADMIN_REQUIRED", message: "Cet espace est réservé aux administrateurs." }); return; }
  const [users, products, shops, orders, payments] = await Promise.all([
    supabaseTable<Row[]>("profiles", "?select=id", {}, context.accessToken),
    supabaseTable<Row[]>("products", "?select=id", {}, context.accessToken),
    supabaseTable<Row[]>("shops", "?select=id", {}, context.accessToken),
    supabaseTable<Row[]>("orders", "?select=id", {}, context.accessToken),
    supabaseTable<Row[]>("payments", "?select=id", {}, context.accessToken),
  ]);
  const failed = [users, products, shops, orders, payments].find((result) => !result.ok);
  if (failed) { sendSupabaseError(res, failed); return; }
  res.json({ overview: { users: asRows(users.data).length, products: asRows(products.data).length, shops: asRows(shops.data).length, orders: asRows(orders.data).length, payments: asRows(payments.data).length } });
});

export default router;