import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CredentialsSignUpForm from './credentials-signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';  //shadcn card component

//set page title to "Sign up"
export const metadata: Metadata = {
  title: 'Sign Up',
};


//SignUp page - we check callbackUrl from searchParams, callback URL is the page that user was at before signing up, so we can redirect him to it again 
const SignUp = async (props: { searchParams: Promise<{ callbackUrl: string }> }) => {
  
  const { callbackUrl } = await props.searchParams;       //get callbackUrl from searchParams (in a server component)

  //check if user is already signed in with Next_Auth session from auth(), then redirect to the callbackUrl or "/"
  const session = await auth();
  if (session) { return redirect(callbackUrl || '/') }

  return (
    <div className='w-full max-w-md mx-auto'>
      <Card>
        <CardHeader className='space-y-4'>
          {/* Logo */}  
          <Link href='/' className='flex-center'>
            <Image priority={true} src='/images/logo.svg' width={100} height={100} alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`} />
          </Link>
          {/* Card title & description */}
          <CardTitle className='text-center'>Create Account</CardTitle>
          <CardDescription className='text-center'> Enter your information below to create your account </CardDescription>
        </CardHeader>
        {/* Form component */}
        <CardContent className='space-y-4'><CredentialsSignUpForm /></CardContent>
      </Card>
    </div>
  );
};

export default SignUp;