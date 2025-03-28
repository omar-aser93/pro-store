'use client';
import { useSession } from 'next-auth/react';
import { updateProfileSchema, updateProfileType } from '@/lib/validator';
import { updateProfile } from '@/lib/actions/user.actions';
//import "react-hook-form" hook & zodResolver 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
//Shadcn components
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


// ProfileForm component, to update user's personal data
const ProfileForm = () => {

  const { data: session, update } = useSession();      //useSession hook to get & to update session's data without refresh
  const { toast } = useToast();                        //useToast hook to show toast messages

  //useForm hook, pass (Zod Schema & type) to the zodResolver of "react-hook-form" & set default values
  const form = useForm<updateProfileType>({ resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: session?.user?.name ?? '', email: session?.user?.email ?? '' },
  });  

  // Handle form Submit to update profile
  async function onSubmit(values: updateProfileType) {    
    const res = await updateProfile(values);         //server-action to update user's profile, pass the form values  
    if (!res.success) return toast({ variant: 'destructive', description: res.message });   //if error, show error in a toast
    //create a new session object with the updated user data  
    const newSession = { ...session, user: { ...session?.user, name: values.name } };    
    await update(newSession);                    //update the session with the new session object  
    toast({ description: res.message });         //show success message in a toast
  }

  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className='flex flex-col gap-5'>
          {/* Email input .. disabled */}  
          <FormField control={form.control} name='email' render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input disabled placeholder='Email' {...field} className='input-field' />
                </FormControl>
                <FormMessage />
              </FormItem>
           )} />
           {/* Name input */}
          <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input placeholder='Name' {...field} className='input-field' />
                </FormControl>
                <FormMessage />
              </FormItem>
           )} />
        </div>
        {/* Submit button, disabled if form is submitting (using formState.isSubmitting from "react-hook-form") */}
        <Button type='submit' size='lg' disabled={form.formState.isSubmitting} className='button col-span-2 w-full' >
          {form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
};
export default ProfileForm;