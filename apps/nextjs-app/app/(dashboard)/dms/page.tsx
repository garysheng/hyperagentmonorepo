'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { DMList } from '@/components/dms/dm-list'
import { DMFilters } from '@/components/dms/dm-filters'

// Mock data for development
const mockDMs = [
  {
    id: '1',
    sender: {
      username: 'johndoe',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
    message: 'Hey, I would love to collaborate on a project!',
    timestamp: new Date('2024-01-20T10:00:00Z'),
    relevance_score: 4,
    status: 'pending' as const,
  },
  {
    id: '2',
    sender: {
      username: 'janedoe',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    },
    message: 'Looking forward to working together!',
    timestamp: new Date('2024-01-20T11:00:00Z'),
    relevance_score: 3,
    status: 'approved' as const,
  },
]

export default function DMsPage() {
  const { user, loading } = useAuth()
  const [selectedDM, setSelectedDM] = useState<string>()

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
            dms={mockDMs}
            selectedDM={selectedDM}
            onSelectDM={setSelectedDM}
          />
        </div>
        <div className="col-span-2">
          <DMFilters />
        </div>
      </div>
    </div>
  )
} 