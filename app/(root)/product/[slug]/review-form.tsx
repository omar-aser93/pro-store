'use client';
import { useState } from 'react';
import { StarIcon } from 'lucide-react';             //icons library auto installed by shadcn
import { createUpdateReview, getReviewByProductId } from '@/lib/actions/review.actions';
import { insertReviewSchema, Review } from '@/lib/validator';
//import "react-hook-form" hooks & zodResolver 
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
//shadcn components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


//ReviewForm dialog component, receives the userId, productId 
const ReviewForm = ({ userId, productId }: { userId: string; productId: string; }) => {
  
  const [open, setOpen] = useState(false);            //state to check if the form dialog is opened or closed
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);   //state to check the hovered rating 
  const { toast } = useToast();                       //useToast hook from shadcn, used to display a toast messages

  //useForm hook, pass (Zod Schema & type) to the zodResolver of "react-hook-form" & set default values
  const form = useForm<Review>({ resolver: zodResolver(insertReviewSchema), defaultValues: { title: '', description: '', rating: 0 } });

  // Function to open the form dialog (modal)
  const handleOpenForm = async () => {
    //The form inputs is only the title, description & rating, but our validator needs the userId & productId.
    form.setValue('productId', productId);
    form.setValue('userId', userId);  
    //get current user review for this product using getReviewByProductId() server-action
    const review: Review | null = await getReviewByProductId({ productId });   
    //if current user has a review, fill the form with this review data, so the User can update his review
    if (review) {
      form.setValue('title', review.title);
      form.setValue('description', review.description);
      form.setValue('rating', review.rating);
    }
    setOpen(true);                        //open the form dialog
  };

  // Form submit handler function
  const onSubmit: SubmitHandler<Review> = async (values) => {
    const res = await createUpdateReview({ ...values, productId });     //pass form values & productId to createUpdateReview() server-action
    if (!res.success) return toast({ variant: 'destructive', description: res.message });  //if failed, display a toast error message
    setOpen(false);                                //close the form dialog
    toast({ description: res.message });           //if success, display a toast success message
  };

  
return (
  //shadcn Dialog, takes open_state & setOpen as props
  <Dialog open={open} onOpenChange={setOpen}>
    {/* Button to open the form dialog */}
    <Button onClick={handleOpenForm} variant='default'> Write a review </Button>
    
    {/* Dialog Content */}
    <DialogContent className='sm:max-w-[425px]'>
      <Form {...form}>
        <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
            <DialogDescription> Share your thoughts with other customers </DialogDescription>
          </DialogHeader>          
          <div className='grid gap-4 py-4'>
            {/* Title input */}
            <FormField control={form.control} name='title' render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder='Enter title' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>)} />
            {/* Description input */}
            <FormField control={form.control} name='description' render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder='Enter description' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>)} />
        
            {/* Star Rating Input */}
            <FormField control={form.control} name='rating' render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <div className='flex gap-1'>
                  {Array.from({ length: 5 }).map((_, index) => {                    
                    return (                    
                    <StarIcon key={index} onClick={() => field.onChange(index + 1)} onMouseEnter={() => setHoveredRating(index + 1)} onMouseLeave={() => setHoveredRating(null)}
                        className={`h-6 w-6 cursor-pointer transition-colors ${(hoveredRating !== null ? hoveredRating : field.value) >= index + 1 ? 'fill-yellow-500' : 'fill-gray-300' }`} />
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem> )} />
          </div>

          {/* Submit button, disabled at `reac-hook-form` Submitting  */}
          <DialogFooter>
            <Button type='submit' size='lg' className='w-full' disabled={form.formState.isSubmitting} >
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
  );
};

export default ReviewForm;