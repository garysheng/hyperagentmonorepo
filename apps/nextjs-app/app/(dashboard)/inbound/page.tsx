'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { DMList } from '@/components/dms/dm-list'
import { DMFilters, type DMFilters as DMFiltersType } from '@/components/dms/dm-filters'
import { DMDetail } from '@/components/dms/dm-detail'
import { getOpportunities } from './actions'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Opportunity } from '@/types'
import { BulkTranscriptWizard } from '@/components/opportunities/bulk-transcript-wizard'

export default function InboundPage() {
  const { user, loading } = useAuth()
  const queryClient = useQueryClient()
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [filters, setFilters] = useState<DMFiltersType>({
    statuses: {
      pending: true,    // Show pending by default
      approved: false,  // Hide approved by default
      rejected: false,  // Hide rejected by default
    },
    minRelevanceScore: -1,
    assignedTo: 'all',
    needsDiscussion: false
  })

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: getOpportunities,
    enabled: !!user,
  })

  // Filter and sort opportunities
  const filteredOpportunities = opportunities
    // Filter based on selected statuses
    .filter(opp => {
      // If no statuses are selected, show nothing
      if (!filters.statuses.pending && !filters.statuses.approved && !filters.statuses.rejected) {
        return false;
      }
      
      // Check if the opportunity's status matches any of the selected statuses
      switch (opp.status) {
        case 'pending':
          return filters.statuses.pending;
        case 'approved':
          return filters.statuses.approved;
        case 'rejected':
          return filters.statuses.rejected;
        case 'conversation_started':
          return false; // Always hide in-conversation opportunities
        default:
          return false;
      }
    })
    // Apply other filters
    .filter((opp) => {
      if (opp.relevance_score < filters.minRelevanceScore) {
        return false;
      }
      if (filters.assignedTo !== 'all' && opp.assigned_to !== filters.assignedTo) {
        return false;
      }
      if (filters.needsDiscussion && !opp.needs_discussion) {
        return false;
      }
      return true;
    })
    // Sort by relevance score (highest first)
    .sort((a, b) => b.relevance_score - a.relevance_score)

  const handleProcessComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['opportunities'] })
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inbound Messages</h2>
        <BulkTranscriptWizard 
          opportunities={opportunities} 
          onProcessComplete={handleProcessComplete}
        />
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