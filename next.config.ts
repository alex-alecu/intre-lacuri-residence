import type { NextConfig } from 'next';

const githubPages = process.env.GITHUB_PAGES === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/intre-lacuri-residence';
const nextConfig: NextConfig = githubPages ? {
  output: 'export',
  // Public links use sitePath(). This single-page app has no client routes.
  // Keeping the framework route at / also avoids vinext's export base-path bug.
  assetPrefix: `https://alex-alecu.github.io${basePath}`,
  trailingSlash: true,
  images: { unoptimized: true },
} : {};

export default nextConfig;
