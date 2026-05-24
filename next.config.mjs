/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'generativelanguage.googleapis.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // for image uploads
    },
  },
}

export default nextConfig
