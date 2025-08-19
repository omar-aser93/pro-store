import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';               // next-intl plugin for internationalization

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io', port: '' },           // upload-thing lib setup 
      { protocol: 'https', hostname: '**.ufs.sh', port: '' },         // ✅ allow all UploadThing new subdomains    
    ],      
  },
};

const withNextIntl = createNextIntlPlugin('./i18n.ts');   // Create next-intl plugin for internationalization
export default withNextIntl(nextConfig);                  // Export the next config with next-intl plugin
