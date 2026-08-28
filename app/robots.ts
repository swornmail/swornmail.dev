import type { MetadataRoute } from "next";

// `output: export` has no server to evaluate a metadata route at request
// time, so Next requires the route to declare itself static explicitly.
export const dynamic = "force-static";

/**
 * Shipped in the repository rather than left to Cloudflare's managed
 * robots.txt, which blocks GPTBot, ClaudeBot, Google-Extended, CCBot and
 * others by default. See the identical file in swornmail.com for the full
 * reasoning; it applies with more force here, because this is the reference
 * documentation an implementer needs to find.
 *
 * Cloudflare's managed block must also be turned off at the zone, or it is
 * served instead of this file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://swornmail.dev/sitemap.xml",
  };
}
