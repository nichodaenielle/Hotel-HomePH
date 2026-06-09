/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true // Required for static export on Hostinger
  }
};

module.exports = nextConfig;