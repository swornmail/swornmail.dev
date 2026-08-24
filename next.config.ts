import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the build emits plain HTML into out/, which is what goes to
  // S3. No Node server, nothing to patch, and every page is readable before
  // any JavaScript runs.
  output: "export",

  // CloudFront serves .../path/index.html for /path/ when objects are laid out
  // as directories. Trailing slashes keep the emitted links and the stored
  // keys in agreement, which is the usual source of S3+CloudFront 404s.
  trailingSlash: true,

  // The export target has no image optimiser, and this site ships no raster
  // images anyway.
  images: { unoptimized: true },

  // Never publish a source map of the site's own code: nothing here needs
  // debugging in public and it doubles the transferred bytes.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
