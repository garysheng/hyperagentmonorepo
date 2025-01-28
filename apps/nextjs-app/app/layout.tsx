import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/header'
import { cn } from '@/lib/utils'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "HyperAgent - AI-Powered DM Management",
    template: "%s | HyperAgent"
  },
  description: "Manage your Twitter DMs efficiently with AI-powered filtering and prioritization. Perfect for celebrities and influencers.",
  keywords: [
    "DM management",
    "Twitter",
    "AI",
    "celebrity",
    "influencer",
    "social media",
    "automation"
  ],
  authors: [
    {
      name: "HyperAgent Team",
      url: "https://hyperagent.so",
    },
  ],
  creator: "HyperAgent",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hyperagent.so",
    title: "HyperAgent - AI-Powered DM Management",
    description: "Manage your Twitter DMs efficiently with AI-powered filtering and prioritization. Perfect for celebrities and influencers.",
    siteName: "HyperAgent",
  },
  twitter: {
    card: "summary_large_image",
    title: "HyperAgent - AI-Powered DM Management",
    description: "Manage your Twitter DMs efficiently with AI-powered filtering and prioritization. Perfect for celebrities and influencers.",
    creator: "@hyperagent",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  // manifest: "/site.webmanifest"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(
      "dark", // Always use dark theme for now
      inter.variable
    )}>
      <head />
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
