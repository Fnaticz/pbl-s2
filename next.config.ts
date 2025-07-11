import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    MONGO_URI: process.env.MONGO_URI,
  },
  images: {
    domains: ['res.cloudinary.com', 'pbl-s2.netlify.app', 'localhost'],
  },
};

export default nextConfig;
