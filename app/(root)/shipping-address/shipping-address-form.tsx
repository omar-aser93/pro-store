'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { updateUserAddress } from '@/lib/actions/user.actions';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { ArrowRight, Loader } from 'lucide-react';                 // icons library auto installed with shadcn
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { SubmitHandler, useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingAddressSchema, shippingAddressType } from '@/lib/validator';
//shadcn form & other components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';



//shipping address form component, we will use shadcn Form  .. we recieve the address prop 
const ShippingAddressForm = ({ address }: { address: shippingAddressType | null; }) => {
  
  const router = useRouter();                     //useRouter() function to navigate to other page dynamically
  const { toast } = useToast();                   //use toast hook to show success/error messages (shadcn)
  const [isPending, startTransition] = useTransition();     //useTransition() hook to allow pending state while submitting/event

  //useForm hook to create a form with zodResolver and defaultValues, we will use the user's address prop as defaultValues || empty values if not found(1st time user entering his adress)  
  const form = useForm<shippingAddressType>({ resolver: zodResolver(shippingAddressSchema), defaultValues: address || { fullName: '', streetAddress: '', city: '', postalCode: '', country: '' } });

  //onSubmit function to handle the form submission, will recieve the shadcn form values
  const onSubmit: SubmitHandler<shippingAddressType> = async ( values ) => {    
    startTransition(async () => {
      //server-action to set the user's address in db, when user submits the form for the 1st time, 2nd/other times we will fetch his address from the db & set as defaultValues, also he can update them if he wants
      const res = await updateUserAddress(values);       
      //if error, show res error in a toast 
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message });
        return;                       //return out of the function 
      }  
      router.push('/payment-method');           //if success, navigate to the next-step page
    });
  };

  return (
    <>
      {/* CheckoutSteps component, we pass the current step number to change style of the active step title */}
      <CheckoutSteps current={1} />            
      <div className='max-w-md mx-auto space-y-4'>
        {/* title and description */}
        <h1 className='h2-bold mt-4'>Shipping Address</h1>
        <p className='text-sm text-muted-foreground'> Please enter the address that you want to ship to </p>
        
        {/* shadcn Form component with onSubmit event, and formFields inputs .. check the docs */}
        <Form {...form}>
          <form method='post' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4' >
            <div className='flex flex-col gap-5 md:flex-row'>
              {/*shadcn FormField component, we pass the form.control, name, and render function with field & it's Type */}
              <FormField control={form.control} name='fullName'
                render={({ field }: { field: ControllerRenderProps<shippingAddressType,'fullName'>; }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter full name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-col gap-5 md:flex-row'>
              <FormField control={form.control} name='streetAddress'
                render={({ field }: { field: ControllerRenderProps< shippingAddressType,'streetAddress'>; }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-col gap-5 md:flex-row'>
              <FormField control={form.control} name='city'
                render={({ field }: { field: ControllerRenderProps< shippingAddressType, 'city'>; }) => (
                  <FormItem className='w-full'>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter city' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-col gap-5 md:flex-row'>
              <FormField control={form.control} name='country'
                render={({ field }: { field: ControllerRenderProps< shippingAddressType, 'country'>; }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter country' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-col gap-5 md:flex-row'>
              <FormField control={form.control} name='postalCode'
                render={({ field }: { field: ControllerRenderProps< shippingAddressType, 'postalCode'>; }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter postal code' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* submit button */}
            <div className='flex gap-2'>
              <Button type='submit' disabled={isPending}>
                {isPending ? ( <Loader className='animate-spin w-4 h-4' /> ) : ( <ArrowRight className='w-4 h-4' /> )}
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ShippingAddressForm;