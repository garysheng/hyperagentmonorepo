'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { DMList } from '@/components/dms/dm-list'
import { DMFilters } from '@/components/dms/dm-filters'
import { getDMs } from './actions'
import { useQuery } from '@tanstack/react-query'

export default function DMsPage() {
  const { user, loading } = useAuth()
  const [selectedDM, setSelectedDM] = useState<string>()

  const { data: dms = [], isLoading } = useQuery({
    queryKey: ['dms'],
    queryFn: getDMs,
    enabled: !!user,
  })

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Direct Messages</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-5">
          <DMList
            dms={dms}
            selectedDM={selectedDM}
            onSelectDM={setSelectedDM}
            isLoading={isLoading}
          />
        </div>
        <div className="col-span-2">
          <DMFilters />
        </div>
      </div>
    </div>
  )
} 