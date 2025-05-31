//https://www.npmjs.com/package/resend , check the `resend` docs
import { Resend } from 'resend';            //The `resend` package provides a simple API for sending emails
import { Order } from '@/lib/validator';                   //`Order` type is imported from the zod `validator` module.
import PurchaseReceiptEmail from './purchase-receipt';     //`PurchaseReceiptEmail` component used as an email template
import OTPEmail from "./otp-email";                        //`OTPEmail` component used as an email template
import WelcomeEmail from "./welcome-email";                //`WelcomeEmail` component used as an email template
import NewsletterEmail from "./newsletter-email";          //`NewsletterEmail` component used as an email template

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


// Function to send a welcome email using `Resend` library, receives the email & token as props
export const sendWelcomeNewsletterEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: `${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "Welcome to our newsletter!",
    react: <WelcomeEmail unsubscribeToken={token} />
  });
};


// Function to send a newsletter email using `Resend` library, receives the batch, subject, content & attachments as props
export async function sendNewsletterEmail({ batch, subject, content, attachments }: { batch: { email: string; newsletterToken: string | null }[]; subject: string; content: string; attachments?: {url: string, name: string}[]}) {
  for (const sub of batch) {
    // Map through the attachments, and create an array of objects with (filename & path) properties.     
    const attachmentsData = attachments?.map((file) => {      
      return { filename: file.name, path: file.url }; 
    });
    await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.SENDER_EMAIL}>`,
      to: sub.email,
      subject,
      react: (<NewsletterEmail content={content} unsubscribeToken={sub.newsletterToken!} /> ),
      attachments: attachmentsData,            // Attach the files to the email
    });

    await new Promise(resolve => setTimeout(resolve, 200));     // Throttle slightly to avoid spam filters
  }
}