'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/providers'
import { login, signup } from './actions'
import { Suspense } from 'react'
import { Card } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const message = searchParams.get('message')

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
      router.refresh()
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <Card className="p-6 space-y-4 w-full max-w-sm">
        <div className="text-center">Loading...</div>
      </Card>
    )
  }

  if (user) {
    return (
      <Card className="p-6 space-y-4 w-full max-w-sm">
        <div className="text-center">Redirecting to dashboard...</div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4 w-full max-w-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Enter your email to sign in to your account</p>
      </div>
      {message && (
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      )}
      <form action={login} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <form action={signup} className="space-y-4">
        <Button type="submit" variant="outline" className="w-full">
          Create an account
        </Button>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
} 