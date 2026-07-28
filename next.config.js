/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'fluent-ffmpeg'];
    return config;
  },
};
module.exports = nextConfig;
