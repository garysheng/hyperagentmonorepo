'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createCelebrity } from './actions'


export default function CreateCelebrityPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createCelebrity(formData)

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive'
        })
        return
      }

      if (result.success && result.redirect) {
        window.location.href = result.redirect
      }
    } catch {
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
            <h1 className="text-4xl font-bold tracking-tight">Create Your Celebrity Profile</h1>
            <p className="text-muted-foreground text-lg">
              Set up your celebrity&apos;s profile to start managing their opportunities
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Get Started Quickly</h2>
              <p className="text-muted-foreground">
                Enter your celebrity&apos;s name to create their profile. You can add more details and team members later.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Manage Everything in One Place</h2>
              <p className="text-muted-foreground">
                From your dashboard, you&apos;ll be able to manage opportunities, team members, and settings.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-4">
        <Card className="p-6 space-y-6 w-full max-w-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Create Celebrity Profile</h1>
            <p className="text-muted-foreground">
              Enter the name of the celebrity you&apos;ll be managing
            </p>
          </div>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="celebrityName">Celebrity Name</Label>
              <Input
                id="celebrityName"
                name="celebrityName"
                placeholder="e.g. MrBeast, Gary Sheng"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 