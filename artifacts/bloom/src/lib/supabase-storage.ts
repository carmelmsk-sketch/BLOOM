/**
 * Supabase Storage utilities for cover image uploads
 * Bucket: products_covers (public)
 * Path structure: {auth_uid}/{product_id}/{filename}
 * RLS: Only creator (auth.uid()) can write to their own uid folder
 * 
 * NOTE: auth.uid() is resolved server-side in supabase-storage route.
 * Frontend must NOT construct the path — it sends the file only,
 * backend receives auth context and builds path securely.
 */

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
}

/**
 * Request upload of a cover image.
 * Backend will:
 * 1. Receive the file and auth context
 * 2. Construct path as: {auth.uid()}/{product_id}/{timestamp-filename}
 * 3. Upload to products_covers bucket
 * 4. Return signed/public URL
 * 
 * @param file - Image file to upload (validated on frontend: image/*, < 5MB)
 * @param productId - Product being covered (validated that user owns this product)
 * @returns Promise<{ url: string; path: string }>
 */
export async function requestCoverUpload(
  file: File,
  productId: string
): Promise<{ url: string; path: string }> {
  if (!file || !productId) {
    throw new Error("File and productId are required");
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File must be smaller than 5MB");
  }

  // Send to backend which will handle auth.uid() and storage securely
  const formData = new FormData();
  formData.append("file", file);
  formData.append("product_id", productId);

  const response = await fetch("/api/upload/cover", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Upload failed with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Delete a cover image.
 * Backend validates ownership before deletion.
 * 
 * @param productId - Product whose cover is being deleted
 */
export async function deleteCover(productId: string): Promise<void> {
  if (!productId) {
    throw new Error("productId is required");
  }

  const response = await fetch(`/api/upload/cover/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Deletion failed with status ${response.status}`
    );
  }
}
