'use client';
import Link from 'next/link';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { signUp } from '@/lib/actions/user.actions';
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from 'lucide-react';                 // icons library auto installed with shadcn
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpFormSchema, signUpType } from '@/lib/validator'; 
//shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


//Credentials sign-up form component
const CredentialsSignUpForm = () => { 

  const router = useRouter();                   //useRouter hook to redirect to a page
  const searchParams = useSearchParams();       //getting searchParams in a client component using useSearchParams() hook
  const callbackUrl = searchParams.get('callbackUrl') || '/';    //we set a callbackUrl const with it's URL param value    
  const [showPassword, setShowPassword] = useState(false);       //state to show/hide password
    
  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(signUp, { message: '', success: false });

  //Define useForm hook & pass (Zod Schema & type) to the zodResolver of "react-hook-form" 
  const { register, handleSubmit, formState: { errors } }  = useForm<signUpType>({ resolver: zodResolver(signUpFormSchema) })
  
  //function to handle "react-hook-form" submit & startTransition to allow pending state 
  const onSubmit = (values: signUpType) => {          
    startTransition(() => { action(values); });        //pass the data to the server_action
  }

  //if action state success is true, navigate to callbackUrl
  useEffect(() => {
    if (data.success) { router.push(callbackUrl); }
  }, [data.success, router, callbackUrl]);   

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-6'>
        {/* Name input */}
        <div>
          <Label htmlFor='name'>Name</Label>
          <Input {...register('name')} id='name' type='text' defaultValue='' autoComplete='name' />
          {errors.name && <div className='text-center text-destructive mt-2'>{errors.name.message}</div>}
        </div>
        {/* Email input */}
        <div>
          <Label htmlFor='email'>Email</Label>
          <Input {...register('email')} id='email' type='email' defaultValue='' autoComplete='email' />
          {errors.email && <div className='text-center text-destructive mt-2'>{errors.email.message}</div>}
        </div>        
        {/* Password input, with eye icon to show/hide password */}
        <div>         
          <Label htmlFor='password'>Password</Label>
          <div className="relative">
            <Input {...register('password')} id='password' type={showPassword ? 'text' : 'password'} defaultValue='' autoComplete='current-password' className='pr-10' />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-2 flex items-center justify-center text-muted-foreground" tabIndex={-1} >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <div className='text-center text-destructive mt-2'>{errors.password.message}</div>}
        </div>   
        {/* Confirm Password input, with eye icon to show/hide password */}
        <div>         
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <div className="relative">
            <Input {...register('confirmPassword')} id='confirmPassword' type={showPassword ? 'text' : 'password'} defaultValue='' autoComplete='current-password' className='pr-10' />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-2 flex items-center justify-center text-muted-foreground" tabIndex={-1} >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <div className='text-center text-destructive mt-2'>{errors.confirmPassword.message}</div>}
        </div>          
        {/* Hidden input for callbackUrl, to persist the callback when we submit the form (used to redirect to previous page) */}
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
  
        {/* Sign up button, if isPending, then show 'Submitting...' & disable the button */}
        <div>
          <Button className='w-full' variant='default' disabled={isPending || data.success}> 
            {isPending || data.success ? 'Submitting...' : 'Sign Up'}
          </Button>
        </div>
  
        {/*get actionState - if error, then show error message*/}    
        {data && !data.success && ( <div className='text-center text-destructive'>{data.message}</div> )}
  
        {/*Link to sign in page*/}
        <div className='text-sm text-center text-muted-foreground'>
          Already have an account?{' '}
          <Link target='_self' className='link' href={`/sign-in?callbackUrl=${callbackUrl}`}> Sign In </Link>
        </div>
      </div>
    </form>
    );
  };
  
  export default CredentialsSignUpForm;
