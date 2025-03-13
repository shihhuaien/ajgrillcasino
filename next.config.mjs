/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Connection", value: "keep-alive" },
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "lob.egcvi.com", // 允許 Evolution 測試環境的所有子域名
      },
      {
        protocol: "https",
        hostname: "static.egcdn.com", // 允許 Evolution 測試環境的所有子域名
      },
    ],
  },
};

export default nextConfig;
