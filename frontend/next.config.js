/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack:true,
  // webpack: (config) => {
  //   config.resolve.fallback = {
  //     ...config.resolve.fallback,
  //     fs: false,
  //     // net: false,
  //     // tls: false,
  //     path:false
  //   };
  //   return config;
  // },
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000",
  },
};

module.exports = nextConfig;
