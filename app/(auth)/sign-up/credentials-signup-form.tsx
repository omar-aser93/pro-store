'use client';
import Link from 'next/link';
import { startTransition, useActionState } from 'react';
import { signUp } from '@/lib/actions/user.actions';
import { useSearchParams } from "next/navigation";
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

  const searchParams = useSearchParams();       //getting searchParams in a client component using useSearchParams() hook
  const callbackUrl = searchParams.get('callbackUrl') || '/';    //we set a callbackUrl const with it's URL param value    

  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(signUp, { message: '', success: false });

  //Define useForm hook & pass (Zod Schema & type) to the zodResolver of "react-hook-form" 
  const { register, handleSubmit, formState: { errors } }  = useForm<signUpType>({ resolver: zodResolver(signUpFormSchema) })
  
  //function to handle "react-hook-form" submit & startTransition to allow pending state 
  const onSubmit = (values: signUpType) => {          
    startTransition(() => { action(values); });        //pass the data to the server_action
  }

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
        {/* Password input */}
        <div>
          <Label htmlFor='password'>Password</Label>
          <Input {...register('password')} id='password' type='password' defaultValue='' autoComplete='current-password' />
          {errors.password && <div className='text-center text-destructive mt-2'>{errors.password.message}</div>}
        </div>
        {/* Confirm Password input */}
        <div>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <Input {...register('confirmPassword')} id='confirmPassword' type='password' defaultValue='' autoComplete='current-password' />
          {errors.confirmPassword && <div className='text-center text-destructive mt-2'>{errors.confirmPassword.message}</div>}
        </div>
        {/* Hidden input for callbackUrl, to persist the callback when we submit the form (used to redirect to previous page) */}
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
  
        {/* Sign up button, if isPending, then show 'Submitting...' & disable the button */}
        <div>
          <Button className='w-full' variant='default' disabled={isPending}> 
            {isPending ? 'Submitting...' : 'Sign Up'}
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
