/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers () {
        return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          ]
        },
        {
          source: '/v1/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          ]
        }
      ]
    },
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'https://api.aimint.meme/:path*',
          },
          {
            source: '/v1/:path*',
            destination: 'https://v1.aimint.meme/:path*',
          },
        ];
      },
    typescript: {
        ignoreBuildErrors: true,
      },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // experimental: {
    //     appDir: true,
    //     enableUndici: true,
    // }, 
    reactStrictMode: false
}

module.exports = nextConfig
