import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VerifyOtpForm from "./verify-otp-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";   //shadcn Card component

//set page title to "Verify Otp"
export const metadata: Metadata = {
    title: " Verify Otp",
};


const VerifyOtpPage = () => {
  return (
    <div className="w-full max-w-md mx-auto py-1">
    <Card>
      <CardHeader className="space-y-4">
        {/* Logo */}  
        <Link href="/" className="flex-center">
          <Image priority={true} src="/images/logo.svg" width={100} height={100} alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`} />
        </Link>
        {/* Card title & description */}
        <CardTitle className="text-center">Verify Otp</CardTitle>
        <CardDescription className="text-center"> Enter the code you recieved on your email to reset your password </CardDescription>
      </CardHeader>
      {/* Form component */}
      <CardContent className="space-y-3"><VerifyOtpForm /></CardContent>
    </Card>
  </div>
  )
}

export default VerifyOtpPage