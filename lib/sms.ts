import Twilio from "twilio";               // Import Twilio library

// create a Twilio client using the Twilio account SID and auth token from environment variables
const client = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

// Function to send an OTP via SMS , we receive the phone number and the OTP as parameters
export async function sendOTPSMS(to: string, otp: string) {
  try {  
    await client.messages.create({    
      from: process.env.TWILIO_FROM_PHONE,
      to,
      body: `Your verification code is ${otp}. It expires in 10 minutes.`,
    })  
  } catch (error) {
    console.error('Failed to send SMS:', error);          // Log the error if sending fails
  }
}