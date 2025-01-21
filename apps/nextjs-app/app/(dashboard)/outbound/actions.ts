import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Opportunity } from '@/types'

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = createClientComponentClient()
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('*, goal:goals(*)')

  if (error) {
    console.error('Error fetching opportunities:', error)
    return []
  }

  return opportunities || []
} 