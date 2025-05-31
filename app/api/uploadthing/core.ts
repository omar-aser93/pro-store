//All this code comes from the [uploadthing documentation](https://docs.uploadthing.com/getting-started/appdir).
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/auth';

const f = createUploadthing();      //create a new uploadthing instance


//creates a file router for the uploadthing library, This is where we define the endpoints & file types and their metadata.
export const ourFileRouter = {

  // Image-only endpoint for image uploads (e.g., product pictures)
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
  //create a middleware that checks if user is authenticated. If not authenticated, throws an error. 
  .middleware(async () => {                               
    const session = await auth();     
    if (!session) throw new UploadThingError('Unauthorized');     
    return { userId: session?.user.id };
  })
  //after user id returns from the middleware, pass it in metadata to the `onUploadComplete` callback.
  .onUploadComplete(async ({ metadata }) => { return { uploadedBy: metadata.userId } }),

  // Multi-file endpoint for different files uploads (e.g., newsletter attachments) 
  fileUploader: f({
    // Define multiple file types with their size limits
    image: { maxFileSize: '4MB', maxFileCount: 5 },
    pdf: { maxFileSize: '16MB', maxFileCount: 5 }, 
    'text/plain': { maxFileSize: '2MB' },   // .txt
    'text/csv': { maxFileSize: '2MB' },     // .csv
    'application/msword': { maxFileSize: '16MB' },  // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '16MB' }, // .docx
    'application/vnd.ms-excel': { maxFileSize: '16MB' },        // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxFileSize: '16MB' },  // .xlsx
    'application/vnd.ms-powerpoint': { maxFileSize: '16MB' },   // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxFileSize: '16MB' },  // .pptx
    'application/zip': { maxFileSize: '32MB' },                 // .zip
    'application/x-rar-compressed': { maxFileSize: '32MB' },    // .rar
  })
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