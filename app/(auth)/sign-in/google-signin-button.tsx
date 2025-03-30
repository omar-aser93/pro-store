'use client'
import { Button } from "@/components/ui/button"
import { signIn} from "next-auth/react";


const GoogleSignin = () => {
  return (
     <div className="w-full max-w-md mx-auto">
      <Button onClick={() => signIn("google", { redirect: false })} className="w-full" >  Sign in with Google </Button>
    </div>
  )
}

export default GoogleSignin