/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `https://messaging-lincoln-committee-monitors.trycloudflare.com/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
