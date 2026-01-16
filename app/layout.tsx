import "./globals.css"; 
//import & apply the Inter font from google fonts
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });     

// app/layout.tsx, a minimal nessary RootLayout because we moved the main layout inside [locale] folder
export default async function RootLayout({ children }: { children: React.ReactNode; }) {  
  return (
  <html suppressHydrationWarning>
    <body className={`${inter.variable} antialiased`}> {children} </body>
  </html>
  );
}