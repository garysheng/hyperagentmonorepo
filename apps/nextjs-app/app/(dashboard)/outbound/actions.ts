import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Opportunity } from '@/types'

export async function getOpportunities(celebrityId: string): Promise<Opportunity[]> {
  const supabase = createClientComponentClient()

  if (!celebrityId) {
    console.error('No celebrity ID provided')
    return []
  }

  // Only fetch approved and conversation_started opportunities
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('*, goal:goals(*)')
    .eq('celebrity_id', celebrityId)
    .in('status', ['approved', 'conversation_started'])
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching opportunities:', error)
    return []
  }

  return opportunities || []
} 