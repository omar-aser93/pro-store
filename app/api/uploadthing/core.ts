//All this code comes from the [uploadthing documentation](https://docs.uploadthing.com/getting-started/appdir).
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/auth';

const f = createUploadthing();      //create a new uploadthing instance

//creates a file router for the uploadthing library 
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    //create a middleware that checks if user is authenticated. If not authenticated, throws an error. 
    .middleware(async () => {                               
      const session = await auth();     
      if (!session) throw new UploadThingError('Unauthorized');     
      return { userId: session?.user.id };
    })
    //after user id returns from the middleware, pass it in metadata to the `onUploadComplete` callback.
    .onUploadComplete(async ({ metadata }) => { return { uploadedBy: metadata.userId } }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;