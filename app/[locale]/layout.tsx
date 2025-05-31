import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';    //next-intl lib Provider for i18n (translation) support
import { ThemeProvider } from 'next-themes';           //next-themes lib for light/dark mode, we wrap the provider around the children 
import { Toaster } from '@/components/ui/toaster';     //shadcn Toaster, we add it under the children 
import GuestCartId from "@/components/guestCartId";    //component we created that manages (guest cart id) cookie

// we get metadata from .env (optional), %s auto replaces the default title with specific page meta title, ex: Home | Prostore
export const metadata: Metadata = {
  title: {template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,  default: process.env.NEXT_PUBLIC_APP_NAME ?? 'Prostore',},
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
};


// LocaleLayout is the main layout for all pages, it wraps the children (their type - {children: React.ReactNode}) + gets i18n URL param
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string }; }) {  
    
  // get current locale (language) from URL params & the messages (translation files)... pass them to the provider
  const { locale } = await params;                                           
  const messages = (await import(`../../messages/${locale}.json`)).default;  
 
  return (
    // pass current locale & dir condition to the (lang & dir) attributes of the wrapper div ..
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>    
      <NextIntlClientProvider locale={locale} messages={messages} >  
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange >
          <GuestCartId />           {/* When a user visits the website, this component will create [a guest cart_id cookie] used to allow guests to add items to a cart without being logged in */}
          {children}
          <Toaster />               {/* shadcn Toaster */}
        </ThemeProvider>
      </NextIntlClientProvider>
    </div>
  );
}
