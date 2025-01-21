'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { DMList } from '@/components/dms/dm-list'
import { DMFilters, type DMFilters as DMFiltersType } from '@/components/dms/dm-filters'
import { DMDetail } from '@/components/dms/dm-detail'
import { getOpportunities } from './actions'
import { useQuery } from '@tanstack/react-query'
import type { Opportunity } from '@/types'

export default function InboundPage() {
  const { user, loading } = useAuth()
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [filters, setFilters] = useState<DMFiltersType>({
    status: 'all',
    minRelevanceScore: -1,
    assignedTo: 'all',
    needsDiscussion: false
  })

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: getOpportunities,
    enabled: !!user,
  })

  // Filter out opportunities that are in conversation (they'll be shown in Outbound)
  const filteredOpportunities = opportunities
    .filter(opp => opp.status !== 'conversation_started')
    .filter((opp) => {
      if (filters.status !== 'all' && opp.status !== filters.status) {
        return false
      }
      if (opp.relevance_score < filters.minRelevanceScore) {
        return false
      }
      if (filters.assignedTo !== 'all' && opp.assigned_to !== filters.assignedTo) {
        return false
      }
      if (filters.needsDiscussion && !opp.needs_discussion) {
        return false
      }
      return true
    })

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inbound Messages</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-3">
          <DMList
            dms={filteredOpportunities}
            selectedDM={selectedOpportunity}
            onSelectDM={setSelectedOpportunity}
            isLoading={isLoading}
          />
        </div>
        <div className="col-span-2">
          <DMDetail dm={selectedOpportunity} />
        </div>
        <div className="col-span-2">
          <DMFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>
    </div>
  )
} 