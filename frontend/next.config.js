/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: "standalone",

  // Configuration API
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : "https://vendor-person-television-increases.trycloudflare.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
