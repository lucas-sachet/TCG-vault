/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Optimizes an image URL using the free images.weserv.nl proxy CDN.
 * Only proxies external HTTP/HTTPS URLs (typically pokemontcg.io) to resize and output as WebP.
 */
export function getOptimizedImageUrl(url: string, width?: number, quality = 90): string {
  if (!url) return '';
  
  // Do not proxy base64, blob URLs, or already proxied URLs
  if (
    url.startsWith('data:') || 
    url.startsWith('blob:') || 
    url.includes('images.weserv.nl')
  ) {
    return url;
  }

  // Only proxy external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const cleanUrl = url.trim();
    const encodedUrl = encodeURIComponent(cleanUrl);
    let proxyUrl = `https://images.weserv.nl/?url=${encodedUrl}&output=webp&q=${quality}`;
    if (width) {
      proxyUrl += `&w=${width}`;
    }
    return proxyUrl;
  }

  return url;
}
