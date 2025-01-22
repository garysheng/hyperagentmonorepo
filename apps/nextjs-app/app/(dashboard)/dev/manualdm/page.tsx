'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/providers/auth-provider'
import { useCelebrity } from '@/hooks/use-celebrity'
import { createTwitterDMOpportunity } from '@/lib/twitter/opportunities'

export default function ManualDMPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: celebrity, isLoading: celebrityLoading } = useCelebrity()
  const [senderUsername, setSenderUsername] = useState('')
  const [messageText, setMessageText] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isLoading = authLoading || celebrityLoading

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8 pl-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !celebrity) {
    return (
      <div className="container space-y-8 py-8 pl-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!user ? 'You must be logged in to access this page.' : 'No celebrity profile found for your account.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      // Create opportunity using Twitter-specific helper
      const opportunity = await createTwitterDMOpportunity(supabase, {
        celebrity_id: celebrity.id,
        conversation_id: conversationId,
        sender_username: senderUsername,
        message_content: messageText
      })

      console.log('Created opportunity:', opportunity)

      setSuccess(true)
      setSenderUsername('')
      setMessageText('')
      setConversationId('')
    } catch (err) {
      console.error('Error creating opportunity:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === 'object' && err !== null) {
        const supabaseError = err as { message?: string, details?: string, hint?: string }
        setError(supabaseError.message || supabaseError.details || supabaseError.hint || 'An unknown error occurred')
      } else {
        setError('Failed to create opportunity from DM')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container space-y-8 py-8 pl-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manual DM Entry (Dev)</h1>
        <p className="text-muted-foreground">
          Create test opportunities from Twitter DMs for development purposes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Opportunity from DM</CardTitle>
          <CardDescription>
            Enter Twitter username and message content to create a test opportunity for {celebrity.celebrity_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Twitter Username</label>
              <Input
                placeholder="e.g. johndoe"
                value={senderUsername}
                onChange={(e) => setSenderUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Conversation ID</label>
              <Input
                placeholder="e.g. 50858307-2211138776 (from Twitter DM URL)"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Text</label>
              <Textarea
                placeholder="Enter the DM content..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
                rows={4}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Opportunity created successfully from DM!</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Opportunity'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 