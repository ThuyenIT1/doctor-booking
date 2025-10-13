/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  // Tối ưu production build
  swcMinify: true,
  // Tối ưu hóa production performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Tối ưu hóa loading
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;