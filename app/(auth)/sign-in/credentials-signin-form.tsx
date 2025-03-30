'use client';
import Link from 'next/link';
import { startTransition, useActionState, useState } from 'react';
import { signInWithCredentials } from '@/lib/actions/user.actions';
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from 'lucide-react';                 // icons library auto installed with shadcn
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInFormSchema, signInType } from '@/lib/validator';     
//shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';



//Credentials sign-in form component
const CredentialsSignInForm = () => {     

  const searchParams = useSearchParams();       //getting searchParams in a client component using useSearchParams() hook
  const callbackUrl = searchParams.get('callbackUrl') || '/';    //we set a callbackUrl const with it's URL param value
  const [showPassword, setShowPassword] = useState(false);       //state to show/hide password

  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(signInWithCredentials, { message: '', success: false });

  //Define useForm hook & pass (Zod Schema & type) to the zodResolver of "react-hook-form" 
  const { register, handleSubmit, formState: { errors } }  = useForm<signInType>({ resolver: zodResolver(signInFormSchema) })

  //function to handle "react-hook-form" submit & startTransition to allow pending state 
  const onSubmit = (values: signInType) => {       
    startTransition(() => { action(values); });       //pass the data to the server_action   
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-6'>
        {/* Email input */}
        <div>
          <Label htmlFor='email'>Email</Label>
          <Input {...register('email')} id='email' type='email' defaultValue='' autoComplete='email' />
          {errors.email && <div className='text-center text-destructive mt-2'>{errors.email.message}</div>}
        </div>       
        {/* Password input, with eye icon to show/hide password */}
        <div className='relative'>         
          <Label htmlFor='password'>Password</Label>
          <Input {...register('password')} id='password' type={showPassword ? 'text' : 'password'} name='password' defaultValue='' autoComplete='current-password' />
          <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword((prev) => !prev)}  className="absolute right-0 top-2/3  -translate-y-1/2" >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
          {errors.password && <div className='text-center text-destructive mt-2'>{errors.password.message}</div>}
        </div>        
        {/* Hidden input for callbackUrl, to persist the callback when we submit the form (used to redirect to previous page) */}
        <input type='hidden' {...register('callbackUrl')} value={callbackUrl} />

        {/* Sign in button, if isPending, then show 'Signing In...' & disable the button */}
        <div>
          <Button className='w-full' variant='default' disabled={isPending}> 
            {isPending ? 'Signing In...' : 'Sign In with credentials'}
          </Button>
        </div>

        {/*get actionState - if error, then show error message*/}    
        {data && !data.success && ( <div className='text-center text-destructive'>{data.message}</div> )}
        
        {/*Link to sign up page*/}
        <div className='text-sm text-center text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link target='_self' className='link' href={`/sign-up?callbackUrl=${callbackUrl}`}> Sign Up </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignInForm;