//`react-email` package is for creating email templates in React... `@react-email/components` package is a set of pre-built components for creating email templates.
import { Html, Head, Body, Container, Heading, Text, Tailwind } from "@react-email/components";

// `OTPEmail` component, used as an email template, receives the OTP code as a prop
export default function OTPEmail({ otp }: { otp: string }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="max-w-lg p-4 border border-gray-300 rounded-lg">
            <Heading className="text-center text-lg font-bold">Your OTP Code</Heading>
            <Text className="text-center text-xl font-semibold tracking-widest">{otp}</Text>
            <Text className="text-gray-600 text-center">Enter this code to reset your password. It expires in 10 minutes.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}