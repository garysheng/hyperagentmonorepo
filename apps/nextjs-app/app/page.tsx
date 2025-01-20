'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  if (loading || user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Manage your DMs with AI
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              HyperAgent helps celebrities and influencers manage their Twitter DMs efficiently with AI-powered filtering and prioritization.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
