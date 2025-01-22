'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers'
import { ArrowRight } from 'lucide-react'

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
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Manage your DMs with AI
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  HyperAgent helps celebrities and influencers manage their Twitter DMs efficiently with AI-powered filtering and prioritization.
                </p>
              </div>
              
              <div className="grid w-full max-w-3xl gap-8 md:grid-cols-2">
                <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                  <h2 className="text-2xl font-bold">Celebrity Admin</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Create a new account to manage your own Twitter DMs and build your team.
                  </p>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/create-celebrity" className="flex items-center justify-center">
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                  <h2 className="text-2xl font-bold">Team Member</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Join an existing celebrity&apos;s team using an invite code from your admin.
                  </p>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/join-team" className="flex items-center justify-center">
                      Join Team
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
