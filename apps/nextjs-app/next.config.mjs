/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.hyperagent.so; style-src 'self' 'unsafe-inline' https://widget.hyperagent.so; connect-src 'self' https://widget.hyperagent.so",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/9.x/**',
      },
    ],
  },
  serverExternalPackages: ['twitter-api-v2'],
  
  // Add headers for security and CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.hyperagent.so; style-src 'self' 'unsafe-inline' https://widget.hyperagent.so; connect-src 'self' https://widget.hyperagent.so"
          }
        ]
      }
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