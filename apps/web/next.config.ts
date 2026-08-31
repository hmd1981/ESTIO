import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "i.pinimg.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "image.thum.io", pathname: "/**" },
      { protocol: "https", hostname: "estio.tech", pathname: "/**" },
      { protocol: "https", hostname: "estio.ir", pathname: "/**" },
      { protocol: "https", hostname: "omanphoto.com", pathname: "/**" },
      { protocol: "https", hostname: "www.omoney.online", pathname: "/**" },
      { protocol: "https", hostname: "www.mycafes.app", pathname: "/**" },
      { protocol: "https", hostname: "www.beenbo.app", pathname: "/**" },
      { protocol: "https", hostname: "www.omansale.online", pathname: "/**" },
      { protocol: "https", hostname: "www.otofix.services", pathname: "/**" },
    ],
  },
  /**
   * Public marketing routes live under /en and /ar only. A bare `/` has no page —
   * mobile users hitting the apex domain often see 404 while desktop users may
   * have cached redirects or bookmarks to /en. Send everyone to the default locale.
   */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
