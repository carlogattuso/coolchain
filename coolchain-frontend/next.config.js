/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/records',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
