//https://www.npmjs.com/package/resend , check the `resend` docs
import { Resend } from 'resend';            //The `resend` package provides a simple API for sending emails
import { Order } from '@/lib/validator';                   //`Order` type is imported from the zod `validator` module.
import PurchaseReceiptEmail from './purchase-receipt';     //`PurchaseReceiptEmail` component used as an email template
import OTPEmail from "./otp-email";                        //`OTPEmail` component used as an email template

const resend = new Resend(process.env.RESEND_API_KEY as string);     //initialize Resend instance with API key from .env 

// Function to send a purchase receipt email using `Resend` library, receives the order as a prop
export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  //using `emails.send` method. We are passing the properties `from`, `to`, `subject`, and `react`. The `react` property is where we will pass our email template.
  await resend.emails.send({
    from: `${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order Confirmation ${order.id}`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};


// Function to send an OTP email using `Resend` library, receives the email & OTP as props
export const sendOTPEmail = async (email: string, otp: string) => {
  await resend.emails.send({
    from: `${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "Your OTP Code",
    react: <OTPEmail otp={otp} />,
  });
};