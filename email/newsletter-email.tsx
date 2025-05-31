//`react-email` package is for creating email templates in React... `@react-email/components` package is a set of pre-built components for creating email templates.
import { Html, Head, Body, Container, Heading, Text, Section, Button, Tailwind, Preview } from "@react-email/components";
import 'dotenv/config';     //using env vars outside of the main app folder, we need to import the `dotenv/config` module.
  
  
// `NewsletterEmail` component, used as an email template, receives the content and unsubscribe token as props
export default function NewsletterEmail({ content, unsubscribeToken }: { content: string; unsubscribeToken: string; }) {
 
  // create an unsubscribe link, the token is used to identify which user made the request (secure without exposing the user id)
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/unsubscribe?token=${unsubscribeToken}`;

  return (
    <Html>
      <Head />
      <Preview> New newsletter from {process.env.NEXT_PUBLIC_APP_NAME || "prostore"} </Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto p-6 max-w-xl">
            <Heading className="text-2xl font-bold text-gray-800 mb-4"> 📰 Latest Updates </Heading>

            {/* The `tiptap` rich-text content is rendered here  */}
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

            <Section className="mt-10 text-center">
              <Text className="text-xs text-gray-400"> Don’t want to receive these emails? 
                <Button href={unsubscribeUrl} className="text-indigo-600 underline text-xs"> Unsubscribe </Button>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
  