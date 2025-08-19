'use client';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Smartphone } from 'lucide-react';                 // icons library auto installed with shadcn
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
 
  const [method, setMethod] = useState<"email"|"phone">("email");    // state to store the method (email or phone)
  const router = useRouter();                                        // useRouter hook to auto redirect to a page

  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(sendForgotPasswordOTP, { message: '', success: false });

  //Define useForm hook & pass (Zod Schema & type) to the zodResolver of "react-hook-form" 
  const { register, handleSubmit, formState: { errors }, getValues, resetField }  = useForm<forgotPasswordType>({ resolver: zodResolver(forgotPasswordSchema) })

  //function to handle "react-hook-form" submit & startTransition to allow pending state 
  const onSubmit = (values: forgotPasswordType) => {    
    startTransition(() => { action(values); });       //pass the data to the server_action 
  }

  //at useActionState() success, redirect to verify-otp page with email/phone as query param  
  useEffect(() => {
    if (data.success) { router.push(`/verify-otp?${method === "email" ? `email=${encodeURIComponent(getValues("email")!)}` : `phone=${encodeURIComponent(getValues("phone")!)}`}`) }
  }, [data.success, getValues, router, method]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>   
      {/* Method selector */} 
      <div className="flex mb-4">
        <Button type="button" size="sm" variant="ghost" className={`${method==="email" ? "font-bold" : "text-muted-foreground"} flex flex-1 items-center gap-2`} onClick={() => {resetField("phone"); setMethod("email")}}><Mail size={16} /> Email</Button>
        <Button type="button" size="sm" variant="ghost" className={`${method==="phone" ? "font-bold" : "text-muted-foreground"} flex flex-1 items-center gap-2`} onClick={() => {resetField("email"); setMethod("phone")}}><Smartphone size={16} /> Phone</Button>
      </div>

      {/* Email or phone input */}
      {method === "email" ? (      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input {...register("email")} id="email" type="email" defaultValue='' placeholder='email@example.com'/>
        {errors.email && <p className="text-destructive mt-1">{errors.email.message}</p>}
      </div>
      ) : (
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input {...register("phone")} id="phone" type="tel" defaultValue='' placeholder="+1234567890" />
        {errors.phone && <p className="text-destructive mt-1">{errors.phone.message}</p>}
      </div>
      )}          

      {/* Submit button, if isPending, then show 'Signing In...' & disable the button */}
      <div>
        <Button className='w-full mt-4 mb-2' variant='default' disabled={isPending}> 
          {isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>

      {/*get actionState - if error, then show error message*/}    
      {data && !data.success && ( <div className='text-center text-destructive'>{data.message}</div> )}
    </form>
  )
}

export default ForgotForm