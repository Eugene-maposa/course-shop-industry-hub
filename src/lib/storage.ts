import { supabase } from "@/integrations/supabase/client";

/**
 * Extract the object path within a bucket from a stored value that may be
 * either a raw storage path (preferred) or a legacy public URL.
 */
export function extractStoragePath(bucket: string, value: string): string {
  if (!value) return value;
  // Match Supabase public/sign URL formats
  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
    `/storage/v1/object/${bucket}/`,
  ];
  for (const m of markers) {
    const idx = value.indexOf(m);
    if (idx !== -1) {
      const rest = value.substring(idx + m.length);
      // Strip query string (e.g. signed url token)
      return rest.split("?")[0];
    }
  }
  return value;
}

/**
 * Create a short-lived signed URL for a private bucket object.
 */
export async function getSignedUrl(
  bucket: string,
  pathOrUrl: string,
  expiresInSeconds = 60
): Promise<string | null> {
  if (!pathOrUrl) return null;
  const path = extractStoragePath(bucket, pathOrUrl);
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) {
    console.error(`Failed to sign URL for ${bucket}/${path}:`, error);
    return null;
  }
  return data?.signedUrl ?? null;
}
