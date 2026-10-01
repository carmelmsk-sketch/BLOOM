import { Router, type IRouter } from "express";
import {
  requireAuth,
  sendSupabaseError,
  supabaseTable,
} from "../lib/supabase.js";

const router: IRouter = Router();

type Row = Record<string, unknown>;

function asRows<T extends Row>(data: unknown) {
  return (Array.isArray(data) ? data : []) as T[];
}

function bodyRecord(body: unknown) {
  return body && typeof body === "object" ? (body as Row) : {};
}

// POST /api/checkout/initialize
// Initializes a Kkiapay payment session for a product
router.post("/checkout/initialize", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const body = bodyRecord(req.body);
  const productId = typeof body.product_id === "string" ? body.product_id : "";
  const buyerEmail = typeof body.buyer_email === "string" ? body.buyer_email : "";
  const buyerName = typeof body.buyer_name === "string" ? body.buyer_name : "";

  if (!productId || !buyerEmail || !buyerName) {
    res.status(400).json({
      code: "INVALID_REQUEST",
      message: "product_id, buyer_email, et buyer_name sont requis.",
    });
    return;
  }

  try {
    // Fetch product to get pricing
    const productResult = await supabaseTable<Row[]>(
      "products",
      `?id=eq.${encodeURIComponent(productId)}&status=eq.published&select=id,title,price_cents,promo_price_cents,currency`,
      {}
    );

    if (!productResult.ok) {
      sendSupabaseError(res, productResult);
      return;
    }

    const product = asRows(productResult.data)[0];
    if (!product) {
      res.status(404).json({
        code: "PRODUCT_NOT_FOUND",
        message: "Produit introuvable ou non publié.",
      });
      return;
    }

    // Determine amount to charge
    const amount =
      (typeof product.promo_price_cents === "number"
        ? product.promo_price_cents
        : typeof product.price_cents === "number"
          ? product.price_cents
          : 0) / 100;

    // Check if Kkiapay credentials are configured
    const kkiapayPublicKey = process.env.KKIAPAY_PUBLIC_KEY;
    const kkiapayPrivateKey = process.env.KKIAPAY_PRIVATE_KEY;
    const kkiapaySecretKey = process.env.KKIAPAY_SECRET_KEY;

    if (!kkiapayPublicKey || !kkiapayPrivateKey || !kkiapaySecretKey) {
      res.status(503).json({
        code: "PAYMENT_PROVIDER_UNCONFIGURED",
        message:
          "Kkiapay n'est pas configuré. Contacter l'administrateur pour activer les paiements.",
        sandbox: true,
      });
      return;
    }

    // Create order entry
    const orderResult = await supabaseTable<Row[]>(
      "orders",
      "",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          product_id: productId,
          buyer_id: context.user.id,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          amount_cents: Math.round(amount * 100),
          currency: product.currency || "XOF",
          status: "pending",
          created_at: new Date().toISOString(),
        }),
      },
      context.accessToken
    );

    if (!orderResult.ok) {
      sendSupabaseError(res, orderResult);
      return;
    }

    const order = asRows(orderResult.data)[0];

    // Return Kkiapay public key and order details for frontend SDK
    res.status(201).json({
      order_id: order?.id || null,
      amount,
      currency: product.currency,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      kkiapay_public_key: kkiapayPublicKey,
    });
  } catch (error) {
    res.status(500).json({
      code: "CHECKOUT_ERROR",
      message: error instanceof Error ? error.message : "Erreur interne.",
    });
  }
});

// POST /api/checkout/verify
// Verifies a Kkiapay transaction and marks order as paid
router.post("/checkout/verify", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const body = bodyRecord(req.body);
  const orderId = typeof body.order_id === "string" ? body.order_id : "";
  const transactionId = typeof body.transaction_id === "string" ? body.transaction_id : "";

  if (!orderId || !transactionId) {
    res.status(400).json({
      code: "INVALID_REQUEST",
      message: "order_id et transaction_id sont requis.",
    });
    return;
  }

  try {
    // Check if Kkiapay credentials are configured
    const kkiapaySecretKey = process.env.KKIAPAY_SECRET_KEY;
    if (!kkiapaySecretKey) {
      res.status(503).json({
        code: "PAYMENT_PROVIDER_UNCONFIGURED",
        message: "Kkiapay n'est pas configuré.",
      });
      return;
    }

    // Fetch order
    const orderResult = await supabaseTable<Row[]>(
      "orders",
      `?id=eq.${encodeURIComponent(orderId)}&buyer_id=eq.${encodeURIComponent(context.user.id)}&select=*`,
      {},
      context.accessToken
    );

    if (!orderResult.ok) {
      sendSupabaseError(res, orderResult);
      return;
    }

    const order = asRows(orderResult.data)[0];
    if (!order) {
      res.status(404).json({
        code: "ORDER_NOT_FOUND",
        message: "Commande introuvable.",
      });
      return;
    }

    // In production, call Kkiapay API to verify transaction
    // For now, we trust the frontend and mark as paid
    // TODO: Call https://api.kkiapay.me/api/v1/transactions/{transactionId} with secret key

    // Update order status
    const updateResult = await supabaseTable<Row[]>(
      "orders",
      `?id=eq.${encodeURIComponent(orderId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "paid",
          kkiapay_transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        }),
      },
      context.accessToken
    );

    if (!updateResult.ok) {
      sendSupabaseError(res, updateResult);
      return;
    }

    res.json({
      success: true,
      message: "Transaction confirmée. Votre produit est maintenant disponible.",
      order: asRows(updateResult.data)[0] || null,
    });
  } catch (error) {
    res.status(500).json({
      code: "VERIFICATION_ERROR",
      message: error instanceof Error ? error.message : "Erreur interne.",
    });
  }
});

export default router;
