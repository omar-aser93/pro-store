import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CredentialsSignInForm from './credentials-signin-form';


//set page title to "Sign In"
export const metadata: Metadata = {
  title: "Sign In",
};


//SignIn page - we check callbackUrl from searchParams, callback URL is the page that user was at before signing in, so we can redirect him to it again 
const SignIn = async ( props: { searchParams: Promise<{ callbackUrl: string }> }) => {
  
  const { callbackUrl } = await props.searchParams;       //get callbackUrl from searchParams (in a server component)
  
  //check if user is already signed in with Next_Auth session from auth(), then redirect to the callbackUrl or "/"
  const session = await auth();
  if (session) { return redirect(callbackUrl || '/') }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          {/* Logo */}  
          <Link href="/" className="flex-center">
            <Image priority={true} src="/images/logo.svg" width={100} height={100} alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`} />
          </Link>
          {/* Card title & description */}
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center"> Select a method to sign in to your account </CardDescription>
        </CardHeader>
        {/* Form component */}
        <CardContent className="space-y-4"><CredentialsSignInForm /></CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
