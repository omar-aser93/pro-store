'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { signInWithCredentials } from '@/lib/actions/user.actions';
import { useSearchParams } from 'next/navigation';
//shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


//Credentials sign-in form component
const CredentialsSignInForm = () => { 
    
  //getting searchParams in a client component using useSearchParams() hook, then we set callbackUrl with it's param value
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(signInWithCredentials, { message: '', success: false });
  return (
    <form action={action}>
      <div className='space-y-6'>
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
        {/* Hidden input for callbackUrl, to persist the callback when we submit the form */}
        <input type='hidden' name='callbackUrl' value={callbackUrl} />

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