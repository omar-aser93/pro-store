'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { signUp } from '@/lib/actions/user.actions';
import { useSearchParams } from 'next/navigation';
//shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


//Credentials sign-up form component
const CredentialsSignUpForm = () => { 
    
  //getting searchParams in a client component using useSearchParams() hook, then we set callbackUrl with it's param value
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(signUp, { message: '', success: false });
  return (
    <form action={action}>
      <div className='space-y-6'>
        {/* Name input */}
        <div>
          <Label htmlFor='name'>Name</Label>
          <Input id='name' name='name' required type='text' defaultValue='' autoComplete='name' />
        </div>
        {/* Email input */}
        <div>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' name='email' required type='email' defaultValue='' autoComplete='email' />
        </div>
        {/* Password input */}
        <div>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' name='password' required type='password' defaultValue='' autoComplete='current-password' />
        </div>
        {/* Confirm Password input */}
        <div>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <Input id='confirmPassword' name='confirmPassword' required type='password' defaultValue='' autoComplete='current-password' />
        </div>
        {/* Hidden input for callbackUrl, to persist the callback when we submit the form */}
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
