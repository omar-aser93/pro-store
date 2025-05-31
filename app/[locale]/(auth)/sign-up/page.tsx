import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CredentialsSignUpForm from './credentials-signup-form';
import GoogleSignin from "@/components/shared/google-signin-button";         //Google sign in button component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';  //shadcn card component

//set page title to "Sign up"
export const metadata: Metadata = {
  title: 'Sign Up',
};


//SignUp page - displays the sign up form
const SignUp = async () => { 
  return (
    <div className='w-full max-w-md mx-auto py-1'>
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
        <hr className="w-[90%] mx-auto mb-4" />
        {/* Google sign in button */}
        <CardContent className="space-y-3"> <GoogleSignin /> </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;