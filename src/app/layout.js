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
  title: "Next.js MongoDB App",
  description: "A Next.js application with MongoDB integration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <AuthProvider>
          <AuthNavbar />
          <main className="container mx-auto py-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
