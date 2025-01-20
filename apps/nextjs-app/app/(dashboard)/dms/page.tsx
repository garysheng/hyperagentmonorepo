'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { DMList } from '@/components/dms/dm-list'
import { DMFilters, type DMFilters as DMFiltersType } from '@/components/dms/dm-filters'
import { DMDetail } from '@/components/dms/dm-detail'
import { getDMs } from './actions'
import { useQuery } from '@tanstack/react-query'
import type { DM } from './actions'

export default function DMsPage() {
  const { user, loading } = useAuth()
  const [selectedDM, setSelectedDM] = useState<string>()
  const [filters, setFilters] = useState<DMFiltersType>({
    status: 'all',
    minRelevanceScore: 1,
  })

  const { data: dms = [], isLoading } = useQuery({
    queryKey: ['dms'],
    queryFn: getDMs,
    enabled: !!user,
  })

  const filteredDMs = dms.filter((dm) => {
    if (filters.status !== 'all' && dm.status !== filters.status) {
      return false
    }
    if (dm.relevance_score < filters.minRelevanceScore) {
      return false
    }
    return true
  })

  const selectedDMData = dms.find((dm) => dm.id === selectedDM)

  const handleApprove = async (id: string) => {
    // TODO: Implement approve action
    console.log('Approve DM:', id)
  }

  const handleReject = async (id: string) => {
    // TODO: Implement reject action
    console.log('Reject DM:', id)
  }

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
          <DMDetail
            dm={selectedDMData}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
        <div className="col-span-2">
          <DMFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>
    </div>
  )
} 