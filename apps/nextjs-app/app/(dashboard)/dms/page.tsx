'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { DMList } from '@/components/dms/dm-list'
import { DMFilters, type DMFilters as DMFiltersType } from '@/components/dms/dm-filters'
import { DMDetail } from '@/components/dms/dm-detail'
import { getDMs } from './actions'
import { useQuery } from '@tanstack/react-query'
import type { Opportunity as DM } from '@/types'

export default function DMsPage() {
  const { user, loading } = useAuth()
  const [selectedDM, setSelectedDM] = useState<DM | null>(null)
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

  const { data: dms = [], isLoading } = useQuery({
    queryKey: ['dms'],
    queryFn: getDMs,
    enabled: !!user,
  })

  const filteredDMs = dms
    // Filter based on selected statuses
    .filter(dm => {
      // If no statuses are selected, show nothing
      if (!filters.statuses.pending && !filters.statuses.approved && !filters.statuses.rejected) {
        return false;
      }
      
      // Check if the DM's status matches any of the selected statuses
      switch (dm.status) {
        case 'pending':
          return filters.statuses.pending;
        case 'approved':
          return filters.statuses.approved;
        case 'rejected':
          return filters.statuses.rejected;
        case 'conversation_started':
          return false; // Always hide in-conversation DMs
        default:
          return false;
      }
    })
    // Apply other filters
    .filter((dm) => {
      if (dm.relevance_score < filters.minRelevanceScore) {
        return false;
      }
      if (filters.assignedTo !== 'all' && dm.assigned_to !== filters.assignedTo) {
        return false;
      }
      if (filters.needsDiscussion && !dm.needs_discussion) {
        return false;
      }
      return true;
    })
    // Sort by relevance score (highest first)
    .sort((a, b) => b.relevance_score - a.relevance_score)

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Direct Messages</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-3">
          <DMList
            dms={filteredDMs}
            selectedDM={selectedDM}
            onSelectDM={setSelectedDM}
            isLoading={isLoading}
          />
        </div>
        <div className="col-span-2">
          <DMDetail dm={selectedDM} />
        </div>
        <div className="col-span-2">
          <DMFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>
    </div>
  )
} 