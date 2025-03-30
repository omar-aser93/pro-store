'use client'
import { Button } from "@/components/ui/button"
import { signIn} from "next-auth/react";

//Google sign-in button component
const GoogleSignin = () => {

  const handleGooglesignIn = async () => {await signIn("google")};      //Next-auth function to sign in with Google
  return (
     <div className="w-full max-w-md mx-auto">
      <Button onClick={handleGooglesignIn} className="w-full"  variant={'outline'}> 
        <span className="mr-4 font-bold text-lg"> G </span>  Sign in with Google 
      </Button>
    </div>
  )
}

export default GoogleSignin