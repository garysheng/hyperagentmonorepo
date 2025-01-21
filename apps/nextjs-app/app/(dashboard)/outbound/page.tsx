'use client'

import { useAuth } from '@/components/providers'
import { getOpportunities } from './actions'
import { useQuery } from '@tanstack/react-query'
import type { Opportunity } from '@/types'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export default function OutboundPage() {
  const { user, loading } = useAuth()

  const { data: opportunities = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ['opportunities'],
    queryFn: getOpportunities,
    enabled: !!user,
  })

  // Only show approved and conversation_started opportunities
  const filteredOpportunities = opportunities.filter(
    (opp: Opportunity) => opp.status === 'approved' || opp.status === 'conversation_started'
  )

  const readyForOutreach = filteredOpportunities.filter(
    (opp: Opportunity) => opp.status === 'approved'
  )
  const inConversation = filteredOpportunities.filter(
    (opp: Opportunity) => opp.status === 'conversation_started'
  )

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Outbound Messages</h2>
      </div>
      <KanbanBoard
        columns={[
          {
            id: 'ready',
            title: 'Ready for Outreach',
            opportunities: readyForOutreach,
          },
          {
            id: 'conversation',
            title: 'In Conversation',
            opportunities: inConversation,
          },
        ]}
        isLoading={isLoading}
      />
    </div>
  )
} 