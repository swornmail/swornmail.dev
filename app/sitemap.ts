import type { MetadataRoute } from "next";
import { NAV } from "./site-chrome";

// `output: export` has no server to evaluate a metadata route at request
// time, so Next requires the route to declare itself static explicitly.
export const dynamic = "force-static";

/**
 * Derived from NAV so the sitemap cannot drift from the documentation map.
 * Adding a page to the sidebar adds it here; there is no second list to
 * remember to update, which is the usual way a sitemap goes stale.
 *
 * `lastModified` is deliberately omitted: a build timestamp would change on
 * every deploy whether or not the content did, which teaches a crawler to
 * ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return NAV.flatMap((group) => group.items).map((item) => ({
    url: `https://swornmail.dev${item.href}`,
    changeFrequency: "monthly" as const,
    priority: item.href === "/" ? 1 : 0.8,
  }));
}
