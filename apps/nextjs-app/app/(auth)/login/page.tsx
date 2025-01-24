'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ArrowRight, Lock } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { login } from './actions'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await login(formData)
      
      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      if (result.success) {
        // Force a hard navigation to the dashboard
        window.location.href = result.redirect || '/dashboard'
        return
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-background" />
        <div className="relative z-20 flex items-center gap-2">
          <Logo size={32} />
          <h1 className="text-2xl font-bold">HyperAgent</h1>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "HyperAgent has transformed how we handle opportunities. The AI scoring is incredibly accurate, 
              and we're able to focus on the partnerships that truly matter."
            </p>
            <footer className="text-sm">Social Media Manager at MrBeast</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <Card className={cn(
            "p-6 backdrop-blur-sm",
            "bg-gradient-to-b from-muted/50 via-muted/30 to-background/50"
          )}>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  disabled={isLoading}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                  className="bg-background/50"
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Card>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                New to HyperAgent?
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" asChild disabled={isLoading}>
            <Link href="/signup">Create an account</Link>
          </Button>
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Lock className="inline h-3 w-3 mr-1" />
            Enterprise-grade security for your team's data
          </p>
        </div>
      </div>
    </div>
  )
} 