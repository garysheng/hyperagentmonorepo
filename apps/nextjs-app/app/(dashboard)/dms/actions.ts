import { Database } from '@/types/supabase'

type OpportunityRow = Database['public']['Tables']['opportunities']['Row']

interface DM extends Omit<OpportunityRow, 'created_at' | 'sender_id'> {
  sender: {
    username: string
    avatar_url: string
  }
  timestamp: Date
}

export async function getDMs(): Promise<DM[]> {
  const response = await fetch('/api/dms')
  if (!response.ok) {
    throw new Error('Failed to fetch DMs')
  }
  const dms = await response.json()
  return dms.map((dm: any) => ({
    ...dm,
    timestamp: new Date(dm.created_at),
  }))
} 