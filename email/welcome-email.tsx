//`react-email` package is for creating email templates in React... `@react-email/components` package is a set of pre-built components for creating email templates.
import { Html, Head, Preview, Tailwind, Body, Container, Heading, Text, Link } from "@react-email/components";
import 'dotenv/config';     //using env vars outside of the main app folder, we need to import the `dotenv/config` module.


// `WelcomeEmail` component, used as an email template , receives the unsubscribe token as a prop
export default function WelcomeEmail({ unsubscribeToken }: { unsubscribeToken: string }) {

  // create an unsubscribe link, the token is used to identify which user made the request (secure without exposing the user id) 
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/unsubscribe?token=${unsubscribeToken}`;

  return (
    <Html>
      <Head />
      <Preview>Welcome to our newsletter!</Preview>
      <Tailwind>
        <Body className="bg-white text-black font-sans">
          <Container className="p-6 max-w-lg mx-auto">
            <Heading className="text-xl mb-2">🎉 Welcome!</Heading>
            <Text className="mb-4">Thanks for subscribing to our newsletter. We&apos;re excited to have you on board!</Text>
            <Text className="mb-4">You&apos;ll be the first to know about product updates, promotions, and more.</Text>
            <Text className="text-sm text-gray-500">
              If you didn’t subscribe or want to unsubscribe, click here:
              <Link href={unsubscribeUrl} className="ml-1 text-blue-600 underline">Unsubscribe</Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}