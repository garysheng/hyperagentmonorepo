'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function ManualDMPage() {
  const [senderUsername, setSenderUsername] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Get the celebrity ID for the current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('celebrity_id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile?.celebrity_id) {
        throw new Error('Could not find celebrity profile')
      }

      // Create an opportunity directly from the DM
      const { error: opportunityError } = await supabase
        .from('opportunities')
        .insert({
          celebrity_id: profile.celebrity_id,
          source: 'TWITTER_DM',
          twitter_dm_conversation_id: `manual_${Date.now()}`,
          twitter_dm_event_id: `manual_${Date.now()}`,
          twitter_sender_id: `manual_${Date.now()}`,
          twitter_sender_username: senderUsername,
          description: messageText,
          status: 'NEW',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (opportunityError) {
        throw opportunityError
      }

      setSuccess(true)
      setSenderUsername('')
      setMessageText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create opportunity from DM')
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
            Enter Twitter username and message content to create a test opportunity
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