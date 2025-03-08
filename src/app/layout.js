import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/components/auth/AuthProvider';
import AuthNavbar from '@/components/auth/AuthNavbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Flow - Streamline Your Workflow",
  description: "Transform your workflow with AI-powered automation and smart insights",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}
      >
        <AuthProvider>
          <AuthNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
