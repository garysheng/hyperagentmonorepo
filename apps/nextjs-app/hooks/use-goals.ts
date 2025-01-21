import { useQuery } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'

type Goal = Database['public']['Tables']['goals']['Row']

async function fetchGoals(): Promise<Goal[]> {
  const response = await fetch('/api/goals')
  if (!response.ok) {
    throw new Error('Failed to fetch goals')
  }
  return response.json()
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  })
} 