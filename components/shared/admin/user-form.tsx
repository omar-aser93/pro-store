'use client';
import { useRouter } from 'next/navigation';
import { updateUserSchema, updateUserType } from '@/lib/validator';
import { updateUser } from '@/lib/actions/user.actions';
////imports of 'react-hook-form' & zodResolver
import { useForm } from 'react-hook-form';
import { ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
//Shadcn components
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';


//User form component, receives User data as prop, to set form default values for update 
const UserForm = ({ user }: {  user: updateUserType }) => {
  
  const router = useRouter();                            //useRouter hook to navigate to a page
  const { toast } = useToast();                          //useToast hook to show toast messages

  //Define useForm hook & pass (Zod Schema & type) to the zodResolver, also pass default values
  const form = useForm<updateUserType>({ resolver: zodResolver(updateUserSchema), defaultValues: user });

  //Handle form submit
  const onSubmit = async (values: updateUserType ) => {         
    const res = await updateUser({ ...values, id: user.id });        //pass the form data to updateUser server-action
    if (!res.success) {
        toast({ variant: 'destructive', description: res.message });   //if error, show error toast
    } else {
        router.push(`/admin/users`);                                   //if success, navigate to Admin Users page
    }    
  };

  return (
    <Form {...form}>
      <form method='post' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
      { /* Email */ }
        <div>
          <FormField control={form.control} name='email' render={({ field }: { field: ControllerRenderProps<updateUserType, 'email'> }) => (
            <FormItem className='w-full'>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled={true} placeholder='Enter user email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem> )}
          />
        </div>
        {/* Name */}
        <div>
          <FormField control={form.control} name='name' render={({ field }: { field: ControllerRenderProps<updateUserType, 'name'> }) => (
            <FormItem className='w-full'>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter user name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem> )}
          />  
        </div>   
        {/* Role select */} 
        <div>
          <FormField control={form.control} name='role' render={({ field }: { field: ControllerRenderProps<updateUserType, 'role'> }) => (
            <FormItem className=' items-center'>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value.toString()}>
                <FormControl>
                  <SelectTrigger> <SelectValue placeholder='Select a role' /> </SelectTrigger>
                </FormControl>
                <SelectContent> 
                  {process.env.NEXT_PUBLIC_USER_ROLES?.split(', ').map((role) => (<SelectItem key={role} value={role}> {role} </SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem> )}
          />  
        </div>

        {/* Submit Button, disable at `reac-hook-form` Submitting */}  
        <Button type='submit' className='w-full' disabled={form.formState.isSubmitting} >
          {form.formState.isSubmitting ? 'Submitting...' : `Update User `}
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;