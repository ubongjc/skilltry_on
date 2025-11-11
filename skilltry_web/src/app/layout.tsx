import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillTry-On | Realistic Job Simulations",
  description: "Master workplace skills with 5-15 minute realistic job simulations. Get instant AI-powered feedback and personalized training recommendations.",
  keywords: ["job training", "career development", "skills assessment", "job simulation", "career coaching"],
  authors: [{ name: "SkillTry-On Team" }],
  openGraph: {
    title: "SkillTry-On | Realistic Job Simulations",
    description: "Master workplace skills with realistic job simulations and instant feedback",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorTextOnPrimaryBackground: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          card: "shadow-lg",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#3b82f6" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
