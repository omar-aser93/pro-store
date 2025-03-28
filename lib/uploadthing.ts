import { generateUploadButton, generateUploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
  
/*We are exporting `UploadButton` & `UploadDropzone` components from the `uploadthing` library
also gave them `OurFileRouter` type, And Now we can import them directly in the file where you want to use them */
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();