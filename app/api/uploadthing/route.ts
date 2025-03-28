//code comes from the [uploadthing documentation](https://docs.uploadthing.com/getting-started/appdir).
import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

// Export routes for Nextjs App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});