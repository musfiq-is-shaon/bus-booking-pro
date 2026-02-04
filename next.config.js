/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Ensure proper headers for security and performance
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;

