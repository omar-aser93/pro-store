import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'ar'];     // Define the App supported locales   
export const defaultLocale = 'en';       // Define the default locale
// 'always' if you want to show the prefix of the default locale "/en", 'as-needed' if you don't want the prefix "/en"  
export const localePrefix = 'as-needed';   

//function to handle locale changes for server-side components
export default getRequestConfig(async ({requestLocale}) => {  
  const requested = await requestLocale;                        // get the requested locale
  const currentLocale = requested ? requested : defaultLocale;  // Fallback to default locale if locale not provided
  if (!locales.includes(currentLocale as string)) notFound();   // If the locale is not valid, return a 404 error
  return {
    locale: currentLocale,                                                  // pass the current locale 
    messages: (await import(`./messages/${currentLocale}.json`)).default,   // get translation files    
    direction: currentLocale === 'ar' ? 'rtl' : 'ltr'                       // RTL support configuration
  };
});