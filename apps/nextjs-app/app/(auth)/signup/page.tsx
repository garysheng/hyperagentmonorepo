'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { signup } from '../login/actions'

export default function SignupPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchParams = useSearchParams()
  const celebrityId = searchParams.get('celebrity_id')

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await signup(formData)
      
      if ('error' in result) {
        toast({
          title: 'Sign Up Error',
          description: result.error,
          variant: 'destructive'
        })
        return
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Check your email to confirm your account before logging in',
        })
        if (result.redirect) {
          window.location.href = result.redirect
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 bg-muted items-center justify-center p-8">
        <div className="max-w-lg space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Create Your Account</h1>
            <p className="text-muted-foreground text-lg">
              Set up your account to manage your celebrity&apos;s opportunities
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Get Started Quickly</h2>
              <p className="text-muted-foreground">
                Create your account to start managing opportunities and collaborating with your team.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Secure Access</h2>
              <p className="text-muted-foreground">
                Your account ensures secure access to your celebrity&apos;s opportunities and team settings.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-4">
        <Card className="p-6 space-y-6 w-full max-w-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Create Your Account</h1>
            <p className="text-muted-foreground">
              Enter your details to get started
            </p>
          </div>
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="celebrity_id" value={celebrityId ?? ''} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 