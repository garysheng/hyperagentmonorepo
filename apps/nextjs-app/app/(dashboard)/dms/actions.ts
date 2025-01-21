import { DM } from '@/types'

export async function getDMs(): Promise<DM[]> {
  const response = await fetch('/api/dms')
  if (!response.ok) {
    throw new Error('Failed to fetch DMs')
  }
  return response.json()
}

export async function updateDM(id: string, data: Partial<DM>): Promise<DM> {
  const response = await fetch(`/api/dms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update DM')
  }
  return response.json()
} 