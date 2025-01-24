'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers'
import { ArrowRight, MessageSquare, Sparkles, Bot } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  // If user is logged in, show a welcome message and dashboard link
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              Welcome Back!
            </h1>
            <p className="text-muted-foreground text-lg">
              Continue managing your DMs with AI-powered assistance.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard" className="flex items-center justify-center">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/50">
      <div className="container max-w-6xl px-4">
        <div className="flex flex-col items-center justify-center space-y-12 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <MessageSquare className="h-12 w-12 text-primary animate-pulse" />
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Manage your DMs with AI
              </h1>
              <Bot className="h-12 w-12 text-primary animate-bounce" />
            </div>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl">
              HyperAgent helps celebrities and influencers manage their Twitter DMs efficiently with AI-powered filtering and prioritization.
            </p>
          </div>
          
          <div className="grid w-full max-w-3xl gap-8 md:grid-cols-2">
            <div className="relative flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <h2 className="text-2xl font-bold">Celebrity Admin</h2>
              <p className="text-muted-foreground">
                Create a new account to manage your own Twitter DMs and build your team.
              </p>
              <Button asChild size="lg" className="w-full mt-4">
                <Link href="/signup" className="flex items-center justify-center">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <h2 className="text-2xl font-bold">Team Member</h2>
              <p className="text-muted-foreground">
                Join an existing celebrity's team using an invite code from your admin.
              </p>
              <Button asChild variant="outline" size="lg" className="w-full mt-4">
                <Link href="/join-team" className="flex items-center justify-center">
                  Join Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
