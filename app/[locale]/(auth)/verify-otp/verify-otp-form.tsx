'use client'
import { useEffect, useRef, useState, startTransition, useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOTP, sendForgotPasswordOTP } from '@/lib/actions/user.actions';
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, otpType } from '@/lib/validator';
//shadcn components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


// VerifyOtpForm component for handling OTP verification
const VerifyOtpForm = () => {

  const router = useRouter();                             // useRouter hook to navigate programmatically
  const searchParams = useSearchParams();                 // useSearchParams hook to access URL query parameters
  const email = searchParams.get('email') || '';          // Get email from URL query parameters
  const phone = searchParams.get("phone") || '';          // Get phone from URL query parameters

  //State to manage the OTP input as an array of strings (6 digits), useRef hook to store references to the input elements
  const [otp, setOtp] = useState(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);        

  //useActionState hook .. [data is the state returned from the server_action, action we pass it to form action={}, isPending: status of the req] = useActionState(server_action name, initial state)
  const [data, action, isPending] = useActionState(verifyOTP, { message: '', success: false });
  
  //useActionState hook for handling sendForgotPasswordOTP server-action to allow Resending OTP Afer 60 seconds
  const [resendState, resendAction] = useActionState(sendForgotPasswordOTP, { message: '', success: false });
  const [timeLeft, setTimeLeft] = useState(60);             // State to manage the countdown timer for resending OTP
  const [canResend, setCanResend] = useState(false);        // State to manage whether the resend button is enabled or not

  //Define useForm hook & pass (Zod Schema & type) to the zodResolver of "react-hook-form" + bind the email param to the form default values
  const { handleSubmit, setValue, formState: { errors }} = useForm<otpType>({ resolver: zodResolver(otpSchema), defaultValues: { otp: '', email, phone } });

  //at useActionState() success, redirect to reset-password page with email as query param
  useEffect(() => {
    if (data.success) { router.push(`/reset-password?${email ? `email=${encodeURIComponent(email)}` : `phone=${encodeURIComponent(phone)}`}`) }
  }, [data.success, email, phone, router]);

  //useEffect hook to manage the countdown timer for resending OTP
  useEffect(() => {
    // Enable the resend button when the countdown reaches 0, else keep the countdown running
    if (timeLeft === 0) {
      setCanResend(true);                       
    } else {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);   // Decrease the timer every second
      return () => clearInterval(timer);                // Cleanup the interval on unmount or when timeLeft changes
    }
  }, [timeLeft]);

  //useEffect hook to focus the first input element when the component mounts
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);


  //handleChange function to manage (the OTP input) values changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    // Validate the input value to allow only digits (0-9) and limit to 1 character
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;

    const newOtp = [...otp];            // get the current OTP state
    newOtp[idx] = val;                  // Update the specific index with its new value
    setOtp(newOtp);                     // Update the OTP state with the new values

    if (val && idx < 5) { inputRefs.current[idx + 1]?.focus(); }  // Move focus to next input if current input is filled
    setValue('otp', newOtp.join(''));               // Update the form value with the joined OTP string
  };

  //handleKeyDown function to manage (the OTP input) keyboard events (Backspace, Arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    // check if Backspace is pressed and the current input is empty
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const newOtp = [...otp];                // get the current OTP state
      newOtp[idx - 1] = '';                   // Clear the previous input value
      setOtp(newOtp);                         // Update the OTP state with the new values
      inputRefs.current[idx - 1]?.focus();    // Move focus to the previous input if Backspace is pressed and current input is empty
      setValue('otp', newOtp.join(''));       // Update the form value with the joined OTP string
    }

    // Move focus to the previous input if ArrowLeft is pressed & move focus to the next input if ArrowRight is pressed
    if (e.key === 'ArrowLeft' && idx > 0) { inputRefs.current[idx - 1]?.focus() }  
    if (e.key === 'ArrowRight' && idx < 5) { inputRefs.current[idx + 1]?.focus() }
  };

  //handlePaste function to manage (the OTP input) paste `Ctrl + v` event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').trim();       // Get the pasted text and trim any whitespace
    // Validate the pasted text to ensure it is a 6-digit number
    if (/^\d{6}$/.test(paste)) {
      const newOtp = paste.split('');         // Split the pasted text into an array of characters
      setOtp(newOtp);                         // Update the OTP state with the new values
      // Update current input values in the inputRefs array
      newOtp.forEach((digit, idx) => {
        if (inputRefs.current[idx]) { inputRefs.current[idx]!.value = digit }
      });
      setValue('otp', paste);                   // Update the form value with the pasted OTP string
      inputRefs.current[5]?.focus();            // Move focus to the last input after pasting
    }
  };

  //function to handle "react-hook-form" submit & startTransition to allow pending state 
  const onSubmit = () => {
    //pass (OTP form data & email/phone url param) to the server_action
    startTransition(() => action({ otp: otp.join(''), ...(email && { email }), ...(phone && { phone }) }));   
  };

  //function to handle resend OTP button click & startTransition to allow pending state
  const handleResend = () => {
    //pass (email/phone url param) to the send-otp server_action
    startTransition(() => resendAction( email ? { email } : { phone } ));      
    setTimeLeft(60);                     // Reset the countdown timer to 60 seconds
    setCanResend(false);                 // Disable the resend button until the countdown is over
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="otp">OTP Code</Label>
        <div className="flex gap-2 mt-2 mx-auto max-w-xs">
          {/* Map through the otp state array and render an input for each digit + passing handling events functions */}
          {otp.map((digit, idx) => (
            <Input key={idx} type="text" inputMode="numeric" maxLength={1} className="w-10 text-center" value={digit}
              onChange={(e) => handleChange(e, idx)} onKeyDown={(e) => handleKeyDown(e, idx)} onPaste={handlePaste}
              ref={(el) => {inputRefs.current[idx] = el}} autoComplete="one-time-code"              
            />
          ))}
        </div>
        {/* zodResolver Error message for OTP inputs */}
        {errors.otp && <div className="text-destructive mt-2 text-center">{errors.otp.message}</div>}
      </div>

      {/* Submit button, if isPending, then show 'Verifying...' & disable the button */}
      <Button type="submit" className="w-full" disabled={isPending}> {isPending ? 'Verifying...' : 'Verify'} </Button>

      {/*get verify OTP actionState - if error, then show error message*/}
      {data && !data.success && <div className="text-destructive text-center">{data.message}</div>}
    
      {/* Countdown timer & Resend OTP button */}
      <div className="text-center text-muted-foreground">
        {canResend ? (
          <button type="button" onClick={handleResend} className="underline text-sm"> Resend OTP </button>
        ) : (
          <span className="text-sm">Resend available in {timeLeft}s</span>
        )}
      </div>

      {/*get resend OTP actionState - if error, then show error message*/}
      {resendState && !resendState.success && (<div className="text-destructive text-center">{resendState.message}</div>)}
    </form>
  );
};

export default VerifyOtpForm;
