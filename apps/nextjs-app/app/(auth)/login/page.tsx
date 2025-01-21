'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/providers'
import { login, signup } from './actions'
import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const message = searchParams.get('message')
  const [isSignup, setIsSignup] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
      router.refresh()
    }
  }, [loading, user, router])

  useEffect(() => {
    if (message) {
      toast({
        title: isSignup ? 'Sign Up' : 'Sign In',
        description: message
      })
    }
  }, [message, toast, isSignup])

  if (loading) {
    return (
      <Card className="p-6 space-y-4 w-full max-w-sm">
        <div className="text-center">Loading...</div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4 w-full max-w-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{isSignup ? 'Create an account' : 'Welcome back'}</h1>
        <p className="text-muted-foreground">
          {isSignup ? 'Enter your details to create an account' : 'Enter your email to sign in to your account'}
        </p>
      </div>
      <form action={isSignup ? signup : login} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          {isSignup ? 'Sign Up' : 'Sign In'}
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
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={() => setIsSignup(!isSignup)}
      >
        {isSignup ? 'Already have an account?' : 'Create an account'}
      </Button>
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