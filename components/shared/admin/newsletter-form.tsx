'use client';

import { useState, useTransition } from 'react';
import { createNewsletter } from '@/lib/actions/newsletter.actions';
import { UploadButton } from '@/lib/uploadthing';
import TiptapEditor from '@/components/tiptapEditor';
import { EyeIcon, PaperclipIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewsletterFormData, newsletterFormSchema } from '@/lib/validator';
//shadcn components
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


// This component is used to create a newsletter form with a subject, content editor, and optional attachments.
const NewsletterForm = () => {

  const { toast } = useToast();                                  // Toast hook for notifications
  const router = useRouter();                                    // useRouter hook to navigate to a page
  const [content, setContent] = useState('');                    // State to manage the content input of the newsletter
  const [isUploading, setIsUploading] = useState(false);         // State to manage the uploading state of attachments
  const [isPending, startTransition] = useTransition();          // useTransition() hook to allow pending state while submitting/event
  const [previewOpen, setPreviewOpen] = useState(false);         // State to manage the preview modal open/close state
  const [attachments, setAttachments] = useState<{ url: string, name: string }[]>([]);  // state to manage Uploaded attachment URLs 

  //useForm hook to create a form with zodResolver and defaultValues
  const form = useForm<NewsletterFormData>({ resolver: zodResolver(newsletterFormSchema), defaultValues: { subject: '' } });

  // function to handle form submission
  const onSubmit = (data: NewsletterFormData) => {
    startTransition(async () => {
      try {
        // Pass all the form data to the createNewsletter server-action.. Show succes/error toasts & Redirect to history page        
        await createNewsletter({ subject: data.subject, content, attachments });
        toast({ title: 'Newsletter sent successfully!', description: 'Your newsletter has been sent to subscribers.' });
        router.push('/admin/newsletter/history'); 
      } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'An error occurred while sending the newsletter.', variant: 'destructive' });
      }
    });
  };

  return (
    <Form {...form}>      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Subject input field */}
        <FormField control={form.control} name="subject" render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Enter subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

        {/* Tiptap Content editor component */}
        <div>
          <FormLabel>Newsletter Content</FormLabel>          
          <TiptapEditor content={content} onChange={setContent} placeholder="Start writing here..." />
        </div>        
       
        {/* Attachments uploadthing button, max 5 */}
        <div>
          <FormLabel className='mr-2 rtl:ml-2'>Attachments (optional)</FormLabel>    
          <div className="relative inline-block">
            {/* Custom styled visible button */}
            <Button disabled={isPending || isUploading || attachments.length >= 5} type="button" size="sm" variant="default" title={attachments.length >= 5 ? "Maximum 5 attachments allowed" : "Upload Attachment"} className="w-[200px] pr-3 pl-3" >
              <PaperclipIcon className="h-4 w-4 mr-2" /> {isUploading ? 'Uploading...' : 'Upload Attachments'}
            </Button>
            {/* Invisible Uploadthing Button positioned exactly over the real button, handles the uploading process */}
            <div className="absolute inset-0 z-10">
              <UploadButton endpoint="fileUploader" onUploadBegin={() => setIsUploading(true)} onUploadError={(error: Error) => { toast({ title: 'Upload Error', description: error.message, variant: 'destructive' }); setIsUploading(false); }}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);                  
                  if (!res || res.length === 0) { console.error("No files uploaded"); return; }
                  const urls = res.map((file) => ({ url: file.ufsUrl, name: file.name  }));
                  setAttachments((prev) => [...prev, ...urls]);
                  toast({ title: 'Upload complete', description: `${urls.length} file(s) uploaded.` });                  
                }}
                appearance={{ button: ({ ready }) => ({ width: '100%', height: '100%', opacity: 0, cursor: ready ? 'pointer' : 'not-allowed' }), allowedContent: { display: 'none' } }}
              />
            </div>
          </div>
          {/* Displaying the list of uploaded attachments */}
          {attachments.length > 0 && (
            <ul className="text-sm mt-2 space-y-1 text-gray-600">
              {attachments.map((file, i) => (<li key={i}>📎 {file.name}</li>))}
            </ul>
          )}
        </div>

        {/* Preview Button, opens a modal that preview the newsletter */}
        <div className="flex gap-4">         
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" disabled={!content.trim()} className="flex items-center gap-2 ">
                <EyeIcon className="h-4 w-4" /> Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Newsletter Preview</DialogTitle>
              </DialogHeader>
              <div className="prose dark:prose-invert max-w-none">
                <h2>{form.watch('subject')}</h2>                            {/* Displaying the subject form field value */}
                <div dangerouslySetInnerHTML={{ __html: content }} />       {/* Displaying the tiptap editor content value */}
                {/* Displaying the attachments list */}
                {attachments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium">Attachments</h3>
                    <ul className="list-disc pl-5">
                      {attachments.map((file, i) => (<li key={i}>{file.name}</li>))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        

          {/* Submit button, disabled if isPending */}
          <Button type="submit" disabled={isPending || !content.trim()}>
            {isPending ? 'Sending...' : 'Send Newsletter'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewsletterForm;
