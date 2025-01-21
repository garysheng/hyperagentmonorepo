import { DM } from '@/types'

export async function fetchDMs(): Promise<DM[]> {
  const res = await fetch('/api/dms')
  if (!res.ok) {
    throw new Error('Failed to fetch DMs')
  }
  const data = await res.json()
  return data.map((dm: any) => ({
    ...dm,
    timestamp: new Date(dm.created_at)
  }))
} 