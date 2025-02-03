import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';       //next-themes lib for light/dark mode, we wrap the provider around the children 
import "./globals.css";


const inter = Inter({ subsets: ['latin'] });       //we import the Inter font from google fonts

// we get metadata from .env (optional), %s auto replaces the default title with specific page meta title, ex: Home | Prostore
export const metadata: Metadata = {
  title: {template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,  default: process.env.NEXT_PUBLIC_APP_NAME ?? 'Prostore',},
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
};

// RootLayout is the main layout for all pages, it wraps the children (their type - {children: React.ReactNode})
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`} >
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
