/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabaseClient';

/**
 * Converts a base64 string to a Blob.
 */
function base64ToBlob(base64Data: string): Blob {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Uploads a base64 image (or returns the URL if already a URL) to Supabase Storage.
 */
export async function uploadImageIfBase64(base64OrUrl: string, userId: string, prefix: string): Promise<string> {
  if (!base64OrUrl) return '';
  if (!base64OrUrl.startsWith('data:image/')) {
    // Already a URL or empty, return as-is
    return base64OrUrl;
  }

  try {
    const blob = base64ToBlob(base64OrUrl);
    const fileExt = blob.type.split('/')[1] || 'png';
    const fileName = `${userId}/${prefix}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('specimen-photos')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('specimen-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    console.error('Error uploading image to Supabase Storage:', err);
    throw err;
  }
}
