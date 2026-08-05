/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.shopee.vn" },
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.alicdn.com" }
    ]
  }
};

export default nextConfig;
