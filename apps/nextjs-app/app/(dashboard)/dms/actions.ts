import { type OpportunityRow } from '@/types/supabase'

export interface DM extends Omit<OpportunityRow, 'initial_content'> {
  message: string
  timestamp: Date
  sender: {
    username: string
    avatar_url: string
  }
}

interface RawDM extends OpportunityRow {
  sender_handle: string
}

export async function getDMs(): Promise<DM[]> {
  const response = await fetch('/api/dms')
  const data = (await response.json()) as RawDM[]

  return data.map((dm) => ({
    ...dm,
    message: dm.initial_content,
    timestamp: new Date(dm.created_at),
    sender: {
      username: dm.sender_handle,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dm.sender_id}`,
    },
  }))
} 