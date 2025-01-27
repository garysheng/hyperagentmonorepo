'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOpportunities } from './actions'
import { useCelebrity } from '@/hooks/use-celebrity'
import { toast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { OpportunityList } from '@/components/opportunities/opportunity-list'
import { useAuth } from '@/components/providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OutboundPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { data: celebrity, isLoading: celebrityLoading } = useCelebrity()
  const queryClient = useQueryClient()

  // Handle auth redirect using useEffect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', celebrity?.id],
    queryFn: () => getOpportunities(),
    enabled: !!celebrity?.id
  })

  const sendMessageMutation = useMutation({
    mutationFn: async ({ opportunityId, message }: { opportunityId: string; message: string }) => {
      const opportunity = opportunities?.find(opp => opp.id === opportunityId);
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      const endpoint = opportunity.source === 'TWITTER_DM' 
        ? '/api/messages/twitter'
        : '/api/messages/email'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId,
          message
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.'
      })
    },
    onError: (error) => {
      console.error('Error sending message:', error)
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'There was a problem sending your message. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSendMessage = async (opportunityId: string, message: string) => {
    await sendMessageMutation.mutateAsync({ opportunityId, message })
  }

  // Handle loading and error states
  if (authLoading || celebrityLoading) {
    return <Skeleton className="h-[200px]" />
  }

  if (!user) {
    return null // Will be redirected by useEffect
  }

  if (!celebrity) {
    return (
      <Alert>
        <AlertDescription>
          You need to be logged in as a celebrity to view this page.
        </AlertDescription>
      </Alert>
    )
  }

  const readyForOutreach = opportunities?.filter(opp => opp.status === 'approved') || []
  const inConversation = opportunities?.filter(opp => opp.status === 'conversation_started') || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <div>
        <h2 className="text-lg font-semibold mb-4">1. Ready for Outreach ({readyForOutreach.length})</h2>
        <OpportunityList
          opportunities={readyForOutreach}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">2. In Conversation ({inConversation.length})</h2>
        <OpportunityList
          opportunities={inConversation}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
} 