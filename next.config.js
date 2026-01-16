// import type { NextConfig } from "next";
// import createNextIntlPlugin from 'next-intl/plugin';               // next-intl plugin for internationalization

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       { protocol: 'https', hostname: 'utfs.io', port: '' },           // upload-thing lib setup 
//       { protocol: 'https', hostname: '**.ufs.sh', port: '' },         // ✅ allow all UploadThing new subdomains    
//     ],      
//   },
// };

// const withNextIntl = createNextIntlPlugin('./i18n.ts');   // Create next-intl plugin for internationalization
// export default withNextIntl(nextConfig);                  // Export the next config with next-intl plugin


// next.config.js (alternative approach)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const createNextIntlPlugin = require('next-intl/plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: '**.ufs.sh' },
    ],      
  },
};

// Use the plugin with your i18n configuration
const withNextIntl = createNextIntlPlugin('./i18n.ts');

module.exports = withNextIntl(nextConfig);