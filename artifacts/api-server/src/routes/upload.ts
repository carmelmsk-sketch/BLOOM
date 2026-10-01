import { Router, type IRouter, type Request, type Response } from "express";
import {
  requireAuth,
  supabaseTable,
  sendSupabaseError,
} from "../lib/supabase.js";

const router: IRouter = Router();

type Row = Record<string, unknown>;

function asRows<T extends Row>(data: unknown) {
  return (Array.isArray(data) ? data : []) as T[];
}

/**
 * POST /api/upload/cover
 * Upload product cover image to Supabase Storage
 * 
 * Path constructed server-side:
 *   {auth.uid()}/{product_id}/{timestamp-filename}
 * 
 * This ensures:
 * 1. Only auth.uid() can write to their folder (via RLS)
 * 2. Frontend cannot bypass ownership checks by constructing paths
 * 3. Timestamp prevents collisions
 * 
 * Requires: multipart/form-data with 'file' and 'product_id' fields
 */
router.post("/upload/cover", async (req: Request, res: Response): Promise<void> => {
  const context = await requireAuth(req, res);
  if (!context) return;

  try {
    // Extract form data (depends on multer or similar middleware)
    // For now, assume req.file and req.body.product_id are available
    // In production, configure express-fileupload or multer
    
    const file = (req as any).file;
    const productId = req.body?.product_id as string | undefined;

    if (!file || !productId) {
      res.status(400).json({
        code: "INVALID_REQUEST",
        message: "file and product_id are required.",
      });
      return;
    }

    // Verify product exists and belongs to user
    const productResult = await supabaseTable<Row[]>(
      "products",
      `?id=eq.${encodeURIComponent(productId)}&owner_id=eq.${encodeURIComponent(context.user.id)}&select=id`,
      {},
      context.accessToken
    );

    if (!productResult.ok) {
      sendSupabaseError(res, productResult);
      return;
    }

    const product = asRows(productResult.data)[0];
    if (!product) {
      res.status(403).json({
        code: "PRODUCT_NOT_FOUND",
        message: "Product not found or does not belong to you.",
      });
      return;
    }

    // Construct secure path: {auth.uid()}/{product_id}/{timestamp-filename}
    const fileExt = file.originalname?.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const filename = `${timestamp}.${fileExt}`;
    const secureStoragePath = `${context.user.id}/${productId}/${filename}`;

    // Upload to Supabase Storage via REST API
    // The RLS policy on storage.objects restricts writes to:
    //   (auth.uid() = split_part(name, '/', 1))
    // which means only authenticated user can write to their {auth.uid()} folder

    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(503).json({
        code: "SUPABASE_UNCONFIGURED",
        message: "Supabase is not configured.",
      });
      return;
    }

    const uploadUrl = `${supabaseUrl}/storage/v1/object/products_covers/${secureStoragePath}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${context.accessToken}`,
        "x-upsert": "true",
      },
      body: file.buffer,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text().catch(() => "");
      console.error("Supabase upload error:", error);
      res.status(502).json({
        code: "UPLOAD_FAILED",
        message: "Failed to upload cover image to storage.",
      });
      return;
    }

    // Construct public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/products_covers/${secureStoragePath}`;

    // Update product cover_url in database
    const updateResult = await supabaseTable<Row[]>(
      "products",
      `?id=eq.${encodeURIComponent(productId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          cover_url: publicUrl,
          updated_at: new Date().toISOString(),
        }),
      },
      context.accessToken
    );

    if (!updateResult.ok) {
      sendSupabaseError(res, updateResult);
      return;
    }

    res.status(201).json({
      url: publicUrl,
      path: secureStoragePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      code: "UPLOAD_ERROR",
      message: error instanceof Error ? error.message : "Upload failed.",
    });
  }
});

/**
 * DELETE /api/upload/cover/:productId
 * Delete product cover image
 * Validates ownership before deletion
 */
router.delete(
  "/upload/cover/:productId",
  async (req: Request, res: Response): Promise<void> => {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const productId = req.params.productId;

      // Verify product exists and belongs to user
      const productResult = await supabaseTable<Row[]>(
        "products",
        `?id=eq.${encodeURIComponent(productId)}&owner_id=eq.${encodeURIComponent(context.user.id)}&select=id,cover_url`,
        {},
        context.accessToken
      );

      if (!productResult.ok) {
        sendSupabaseError(res, productResult);
        return;
      }

      const product = asRows(productResult.data)[0];
      if (!product || !product.cover_url) {
        res.status(404).json({
          code: "COVER_NOT_FOUND",
          message: "Product cover not found.",
        });
        return;
      }

      // Extract path from URL (everything after /public/)
      const coverUrl = String(product.cover_url);
      const pathMatch = coverUrl.match(/\/public\/(.+)$/);
      if (!pathMatch) {
        res.status(400).json({
          code: "INVALID_COVER_URL",
          message: "Could not parse cover URL.",
        });
        return;
      }

      const path = pathMatch[1];

      // Delete from Supabase Storage
      const supabaseUrl = process.env.SUPABASE_URL || "";
      if (!supabaseUrl) {
        res.status(503).json({
          code: "SUPABASE_UNCONFIGURED",
          message: "Supabase is not configured.",
        });
        return;
      }

      const deleteUrl = `${supabaseUrl}/storage/v1/object/products_covers/${path}`;
      const deleteResponse = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${context.accessToken}`,
        },
      });

      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        console.error("Supabase delete error:", await deleteResponse.text());
        res.status(502).json({
          code: "DELETE_FAILED",
          message: "Failed to delete cover image.",
        });
        return;
      }

      // Clear cover_url in database
      const updateResult = await supabaseTable<Row[]>(
        "products",
        `?id=eq.${encodeURIComponent(productId)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            cover_url: null,
            updated_at: new Date().toISOString(),
          }),
        },
        context.accessToken
      );

      if (!updateResult.ok) {
        sendSupabaseError(res, updateResult);
        return;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        code: "DELETE_ERROR",
        message: error instanceof Error ? error.message : "Delete failed.",
      });
    }
  }
);

export default router;
