'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendForgotPasswordOTP } from '@/lib/actions/user.actions';
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordType, forgotPasswordSchema } from '@/lib/validator';     
//shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


//ForgotForm, email input component
const ForgotForm = () => {
 
  const router = useRouter();           //useRouter hook to redirect to a page

  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(sendForgotPasswordOTP, { message: '', success: false });

  //Define useForm hook & pass (Zod Schema & type) to the zodResolver of "react-hook-form" 
  const { register, handleSubmit, formState: { errors }, getValues }  = useForm<forgotPasswordType>({ resolver: zodResolver(forgotPasswordSchema) })

  //function to handle "react-hook-form" submit & startTransition to allow pending state 
  const onSubmit = (values: forgotPasswordType) => {       
    startTransition(() => { action(values); });       //pass the data to the server_action 
  }

  //at useActionState() success, redirect to verify-otp page with email as query param  
  useEffect(() => {
    if (data.success) { router.push(`/verify-otp?email=${getValues('email')}`) }
  }, [data.success, getValues, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
    <div className='space-y-6'>
      {/* Email input */}
      <div>
        <Label htmlFor='email'>Email</Label>
        <Input {...register('email')} id='email' type='email' defaultValue='' autoComplete='email' />
        {errors.email && <div className='text-center text-destructive mt-2'>{errors.email.message}</div>}
      </div>          

      {/* Submit button, if isPending, then show 'Signing In...' & disable the button */}
      <div>
        <Button className='w-full' variant='default' disabled={isPending}> 
          {isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>

      {/*get actionState - if error, then show error message*/}    
      {data && !data.success && ( <div className='text-center text-destructive'>{data.message}</div> )}
    </div>
  </form>
  )
}

export default ForgotForm