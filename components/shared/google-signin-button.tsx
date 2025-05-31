'use client'
import { Button } from "@/components/ui/button"
import { signIn} from "next-auth/react";
import { useTransition } from "react";

//Google sign-in button component
const GoogleSignin = () => {

  const [isPending, startTransition] = useTransition();                //useTransition hook to handle a pending state
  //handle function using Next-auth to sign in with Google
  const handleGooglesignIn = () => { startTransition( async() => { await signIn("google")}) };   
  return (
     <div className="w-full max-w-md mx-auto">
      <Button onClick={handleGooglesignIn} variant={'outline'} disabled={isPending} className="w-full hover:text-gray-700"  > 
        <span className="mr-4 font-bold text-lg"> G </span>  Sign in with Google 
      </Button>
    </div>
  )
}

export default GoogleSignin