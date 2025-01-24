'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Bot, Shield, Star, Users, ArrowRight, Lock, Info } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      toast({
        title: 'Check your email',
        description: 'Please check your email to confirm your account before logging in.',
      })
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign up',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-5xl grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8" />
            <h1 className="text-3xl font-bold">HyperAgent</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Team Lead Sign Up</h2>
            <p className="text-muted-foreground">
              Create an admin account to manage your celebrity's opportunities. As a team lead, you'll be able to invite other team members once your account is set up.
            </p>
            <div className="flex items-center gap-2 p-4 bg-blue-500/10 text-blue-500 rounded-lg">
              <Info className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                This form is for celebrity managers and team leads only. Team members should request an invite from their admin instead.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Admin Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Full control over team access, AI settings, and opportunity management for your celebrity.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Team Management</h3>
                <p className="text-sm text-muted-foreground">
                  Invite and manage team members with customizable roles and permissions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Opportunity Control</h3>
                <p className="text-sm text-muted-foreground">
                  Set goals and criteria for the AI to evaluate opportunities for your celebrity.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Create admin account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to set up the celebrity's team account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Full Name</Label>
              <Input
                id="name"
                name="full_name"
                placeholder="e.g. John Smith"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Use your work email - we'll send a confirmation link to verify it
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                'Creating admin account...'
              ) : (
                <>
                  Create admin account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Team member?
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              asChild
              disabled={isLoading}
            >
              <Link href="/join-team">Request team invite</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Enterprise-grade security for your team's data</span>
          </div>
        </Card>
      </div>
    </div>
  )
} 