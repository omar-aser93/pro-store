'use client';

import CheckoutSteps from '@/components/shared/checkout-steps';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ArrowRight, Loader } from 'lucide-react';                    // icons library auto installed with shadcn
import { updateUserPaymentMethod } from '@/lib/actions/user.actions';
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentMethodSchema, paymentMethodType } from '@/lib/validator';
//shadcn form & other components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';


//shipping address form component, we will use shadcn Form  .. we recieve the payment method prop
const PaymentMethodForm = ({ preferredPaymentMethod }: { preferredPaymentMethod: string | null }) => {
  
  const router = useRouter();                     //useRouter() function to navigate to other page dynamically
  const { toast } = useToast();                   //use toast hook to show success/error messages (shadcn)
  const [isPending, startTransition] = useTransition();     //useTransition() hook to allow pending state while submitting/event

  //useForm hook to create a form with zodResolver and defaultValues, we will use the user's pay method prop as defaultValue || default value we defined in .env  
  const form = useForm<paymentMethodType>({ resolver: zodResolver(paymentMethodSchema), defaultValues: {type: preferredPaymentMethod || process.env.DEFAULT_PAYMENT_METHOD } });

  //onSubmit function to handle the form submission, will recieve the shadcn form values
  async function onSubmit(values: paymentMethodType) {
    startTransition(async () => {
      //server-action to set the user's payment method in db 
      const res = await updateUserPaymentMethod(values);
      //if error, show res error in a toast 
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message  });  
        return;                         //return out of the function
      }  
      router.push('/place-order');                //if success, navigate to the next-step page
    });
  }

  return (
    <>
     {/* CheckoutSteps component, we pass the current step number to change style of the active step title */}
      <CheckoutSteps current={2} />
      <div className='max-w-md mx-auto'>
      <Form {...form}>
        <form method='post' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4' >
          {/* title and description */}
          <h1 className='h2-bold mt-4'>Payment Method</h1>
          <p className='text-sm text-muted-foreground'> Please select your preferred payment method </p>
          <div className='flex flex-col gap-5 md:flex-row'>
            {/*shadcn FormField component, we pass the form.control, name, and render function */}
            <FormField control={form.control} name='type' render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} className='flex flex-col space-y-2' >
                      {/* loop through the payment methods we defined in the .env file, then pass it to radio item */}  
                      {process.env.PAYMENT_METHODS?.split(', ').map((paymentMethod) => (
                        <FormItem key={paymentMethod} className='flex items-center space-x-3 space-y-0' >
                          <FormControl>
                            <RadioGroupItem value={paymentMethod} checked={field.value === paymentMethod} />
                          </FormControl>
                          <FormLabel className='font-normal'> {paymentMethod} </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* submit button */}
          <div className='flex gap-2'>
            <Button type='submit' disabled={isPending}>
              {isPending ? (<Loader className='animate-spin w-4 h-4' /> ) : ( <ArrowRight className='w-4 h-4' />  )}
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  </>
  );
};

export default PaymentMethodForm;