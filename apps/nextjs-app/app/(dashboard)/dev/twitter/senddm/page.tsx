'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCelebrity } from '@/hooks/use-celebrity'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'

export default function SendDMPage() {
  const [opportunityId, setOpportunityId] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { data: celebrity } = useCelebrity()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Fetch approved opportunities for testing
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['test-opportunities', celebrity?.id],
    queryFn: async () => {
      if (!celebrity?.id) return []
      
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('celebrity_id', celebrity.id)
        .eq('source', 'TWITTER_DM')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    },
    enabled: !!celebrity?.id
  })

  const handleSendDM = async () => {
    if (!opportunityId || !message) {
      toast({
        title: 'Missing fields',
        description: 'Please provide both an opportunity ID and message.',
        variant: 'destructive'
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/messages/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          opportunityId,
          message
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: data.error || 'Twitter authentication expired. Please reconnect your account.',
            variant: 'destructive',
          })
        } else if (response.status === 429) {
          toast({
            title: 'Rate Limit Reached',
            description: data.error || 'Twitter DM daily limit reached.',
            variant: 'destructive',
          })
          
          // Display rate limit info in the UI
          const rateLimitInfo = data.details
          if (rateLimitInfo) {
            toast({
              title: 'Rate Limit Details',
              description: `Daily limit: ${rateLimitInfo.limit || 'Unknown'}\nResets at: ${rateLimitInfo.reset || 'Unknown'}`,
              variant: 'default',
              duration: 10000, // Show for 10 seconds
            })
          }
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to send message',
            variant: 'destructive',
          })
        }
        return
      }

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      })

      // Clear form
      setMessage('')
      setOpportunityId('')
    } catch (error) {
      console.error('Error sending DM:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Twitter DM API</CardTitle>
          <CardDescription>
            Send a test DM to a Twitter user through an approved opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recent Approved Opportunities */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Approved Twitter Opportunities:</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading opportunities...</p>
            ) : opportunities?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approved Twitter opportunities found.</p>
            ) : (
              <div className="space-y-2">
                {opportunities?.map(opp => (
                  <Card 
                    key={opp.id} 
                    className={`cursor-pointer hover:bg-muted/50 ${opportunityId === opp.id ? 'border-primary' : ''}`}
                    onClick={() => setOpportunityId(opp.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium">@{opp.sender_handle}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {opp.initial_content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Or enter opportunity ID manually:</h3>
            <Input
              placeholder="Opportunity ID"
              value={opportunityId}
              onChange={(e) => setOpportunityId(e.target.value)}
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Message:</h3>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSendDM} 
            disabled={!opportunityId || !message || isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send DM'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 