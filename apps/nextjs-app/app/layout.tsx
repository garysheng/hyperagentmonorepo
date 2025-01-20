import './globals.css'
import { Inter } from 'next/font/google'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HyperAgent',
  description: 'AI-powered DM management for celebrities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
