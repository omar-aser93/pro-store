'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';                       // icons library auto installed with shadcn
import { resetPassword } from '@/lib/actions/user.actions';
import { useActionState, startTransition, useEffect, useState } from 'react';
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, resetPasswordType } from '@/lib/validator';
//shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


//ResetPasswordForm component for handling password reset inputs
const ResetPasswordForm = () => {

  const router = useRouter();                                    //useRouter hook to redirect to a page
  const searchParams = useSearchParams();                        //getting URL searchParams in a client component using useSearchParams() hook
  const email = searchParams.get('email') || '';                 //we set a email const with it's URL param value
  const phone = searchParams.get("phone") || '';                 //we set a phone const with it's URL param value
  const [showPassword, setShowPassword] = useState(false);       //state to show/hide password
  
  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(resetPassword, { message: '', success: false });
 
  //Define useForm hook & pass (Zod Schema & type) to the zodResolver of "react-hook-form"
  const { register, handleSubmit, formState: { errors } } = useForm<resetPasswordType>({
    resolver: zodResolver(resetPasswordSchema), defaultValues: { newPassword: '', confirmPassword: '', email },
  });

  //function to handle "react-hook-form" submit & startTransition to allow pending state
  const onSubmit = (values: resetPasswordType) => {
    //pass (form data & email/phone url param) to the server_action
    startTransition(() => action({ ...values, ...(email && { email }), ...(phone && { phone }) }));     
  };

  // Redirect to sign-in page on success
  useEffect(() => {
    if (data.success) { router.push(`/sign-in`) }
  }, [data.success, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {/* Password input, with eye icon to show/hide password */}
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} id="newPassword" {...register('newPassword')} className="pr-10" />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-2 flex items-center justify-center text-muted-foreground" tabIndex={-1} >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.newPassword && (<div className="text-destructive mt-2 text-center"> {errors.newPassword.message} </div>)}
        </div>
        {/* Confirm Password input, with eye icon to show/hide password */}
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} id="confirmPassword" {...register('confirmPassword')} className="pr-10" />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-2 flex items-center justify-center text-muted-foreground" tabIndex={-1} >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (<div className="text-destructive mt-2 text-center"> {errors.confirmPassword.message} </div>)}
        </div>         

        {/* Submit button, disabled if isPending */}
        <Button className="w-full" disabled={isPending}> {isPending ? 'Resetting...' : 'Reset Password'} </Button>
            
        {/*get actionState - if error, then show error message*/}
        {data && !data.success && <div className="text-destructive text-center">{data.message}</div>}
      </div>
    </form>
  );
};

export default ResetPasswordForm;
