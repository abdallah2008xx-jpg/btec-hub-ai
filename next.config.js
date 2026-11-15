/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'pdfjs-dist'],
  },
  images: {
    domains: ['*'],
  },
};

module.exports = nextConfig;
