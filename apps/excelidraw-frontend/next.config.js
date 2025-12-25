/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize compilation speed
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Reduce bundle size and improve compilation
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-slider",
      "@radix-ui/react-toast",
      "lucide-react",
      "framer-motion",
    ],
  },
  // Faster builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
