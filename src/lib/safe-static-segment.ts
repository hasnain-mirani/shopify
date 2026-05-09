/**
 * Next.js writes static route data under `.next/server/app/.../<segment>.segments`.
 * Very long Shopify-style handles exceed typical NAME_MAX (~255) and break builds
 * (ENAMETOOLONG on Vercel/Linux). Omit those from generateStaticParams only;
 * `dynamicParams` still serves them at request time.
 */
export const MAX_STATIC_SEGMENT_LENGTH = 200;

export function isSafeStaticSegment(s: string): boolean {
  return s.length > 0 && s.length <= MAX_STATIC_SEGMENT_LENGTH;
}
