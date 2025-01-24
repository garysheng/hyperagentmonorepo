/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/9.x/**',
      },
    ],
  },
  serverExternalPackages: ['twitter-api-v2'],
  
  // Add headers for widget files
  async headers() {
    return [
      {
        source: '/widget/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Ensure static files are handled correctly
  output: 'standalone',
  
  // Add rewrites to handle widget files
  async rewrites() {
    return [
      {
        source: '/widget/:path*',
        destination: '/widget/:path*',
      },
    ]
  },
};

export default nextConfig; 