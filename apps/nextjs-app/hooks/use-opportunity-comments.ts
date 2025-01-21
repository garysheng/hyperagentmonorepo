import { useQuery } from '@tanstack/react-query'
import type { OpportunityComment } from '@/types/supabase'

async function fetchComments(id: string): Promise<OpportunityComment[]> {
  const response = await fetch(`/api/opportunities/${id}/comments`)
  if (!response.ok) {
    throw new Error('Failed to fetch comments')
  }
  return response.json()
}

export function useOpportunityComments(id: string) {
  return useQuery({
    queryKey: ['opportunity-comments', id],
    queryFn: () => fetchComments(id),
    enabled: !!id,
  })
} 