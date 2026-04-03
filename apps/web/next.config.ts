import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: {
    domains: ["i.pinimg.com", "images.unsplash.com"],
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
