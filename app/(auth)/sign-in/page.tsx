import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CredentialsSignInForm from './credentials-signin-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";    //shadcn card component

//set page title to "Sign In"
export const metadata: Metadata = {
  title: "Sign In",
};


//SignIn page - displays the sign in form
const SignIn = async () => {
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
