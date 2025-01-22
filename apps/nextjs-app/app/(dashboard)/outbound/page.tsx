'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { getOpportunities } from './actions'
import { useCelebrity } from '@/hooks/use-celebrity'
import { toast } from '@/hooks/use-toast'
import type { Opportunity } from '@/types'

export default function OutboundPage() {
  const { data: celebrity } = useCelebrity()
  const queryClient = useQueryClient()

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', celebrity?.id],
    queryFn: () => getOpportunities(celebrity?.id || ''),
    enabled: !!celebrity?.id
  })

  const sendMessageMutation = useMutation({
    mutationFn: async ({ opportunity, message }: { opportunity: Opportunity; message: string }) => {
      const endpoint = opportunity.source === 'TWITTER_DM' 
        ? '/api/messages/twitter'
        : '/api/messages/email'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opportunity.id,
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

  const handleSendMessage = async (opportunity: Opportunity, message: string) => {
    await sendMessageMutation.mutateAsync({ opportunity, message })
  }

  const readyForOutreach = opportunities?.filter(opp => opp.status === 'approved') || []
  const inConversation = opportunities?.filter(opp => opp.status === 'conversation_started') || []

  const columns = [
    {
      id: 'ready',
      title: 'Ready for Outreach',
      opportunities: readyForOutreach
    },
    {
      id: 'conversation',
      title: 'In Conversation', 
      opportunities: inConversation
    }
  ]

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-semibold mb-6">Outbound Messages</h1>
      <KanbanBoard 
        columns={columns} 
        isLoading={isLoading} 
        onSendMessage={handleSendMessage}
      />
    </div>
  )
} 