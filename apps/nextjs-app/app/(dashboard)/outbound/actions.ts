import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Opportunity } from '@/types'

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = createClientComponentClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  // Get the user's celebrity_id
  const { data: userProfile } = await supabase
    .from('users')
    .select('celebrity_id')
    .eq('id', user.id)
    .single()

  if (!userProfile?.celebrity_id) {
    console.error('No celebrity_id found for user')
    return []
  }

  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('*, goal:goals(*)')
    .eq('celebrity_id', userProfile.celebrity_id)

  if (error) {
    console.error('Error fetching opportunities:', error)
    return []
  }

  return opportunities || []
} 