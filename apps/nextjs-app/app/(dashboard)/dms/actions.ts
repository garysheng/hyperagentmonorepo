interface DM {
  id: string
  sender: {
    username: string
    avatar_url: string
  }
  message: string
  timestamp: Date
  relevance_score: number
  status: 'pending' | 'approved' | 'rejected'
}

interface RawDM {
  id: string
  sender_id: string
  sender_handle: string
  initial_content: string
  created_at: string
  relevance_score: number
  status: 'pending' | 'approved' | 'rejected'
  tags: Record<string, unknown>
}

export async function getDMs(): Promise<DM[]> {
  const response = await fetch('/api/dms')
  if (!response.ok) {
    throw new Error('Failed to fetch DMs')
  }
  const dms = await response.json() as RawDM[]
  return dms.map((dm) => ({
    id: dm.id,
    message: dm.initial_content,
    timestamp: new Date(dm.created_at),
    relevance_score: dm.relevance_score,
    status: dm.status,
    sender: {
      username: dm.sender_handle,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dm.sender_id}`,
    },
  }))
} 