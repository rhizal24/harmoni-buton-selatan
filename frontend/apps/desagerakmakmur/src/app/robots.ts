import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gerakmakmur.caheabusel.com";

/**
 * robots.txt (`/robots.txt`) — izinkan semua halaman publik diindeks,
 * kecuali dashboard admin dan route API internal.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
