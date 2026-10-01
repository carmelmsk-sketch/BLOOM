/**
 * Supabase Storage utilities for cover image uploads
 * Bucket: products_covers (public)
 * Path structure: {creator_uid}/{product_id}/{filename}
 * RLS: Only creator can write to their own uid folder
 */

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
}

/**
 * Upload cover image to Supabase Storage
 * Requires authenticated user (auth context provides uid)
 */
export async function uploadCover(
  file: File,
  creatorId: string,
  productId: string
): Promise<{ url: string; path: string }> {
  const bucket = 'products_covers';
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const filename = `${productId}-${timestamp}.${fileExt}`;
  const path = `${creatorId}/${productId}/${filename}`;

  // Use FormData to upload via Supabase REST API
  const formData = new FormData();
  formData.append('', file);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${path}`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'x-upsert': 'true', // Allow overwrite
      },
      body: file,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload cover image');
  }

  // Construct public URL
  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  return { url, path };
}

/**
 * Delete cover image from Supabase Storage
 */
export async function deleteCover(path: string): Promise<void> {
  const bucket = 'products_covers';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${path}`,
    {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete cover image');
  }
}
