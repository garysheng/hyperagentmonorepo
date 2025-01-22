'use server'

import { createClient } from '@/lib/supabase/server'
import type { Opportunity } from '@/types'
import { TableName } from '@/types'

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  // Get the user's celebrity_id
  const { data: userProfile } = await supabase
    .from(TableName.USERS)
    .select('celebrity_id')
    .eq('id', user.id)
    .single()

  if (!userProfile?.celebrity_id) {
    console.error('No celebrity_id found for user')
    return []
  }

  const { data: opportunities, error } = await supabase
    .from(TableName.OPPORTUNITIES)
    .select(`
      *,
      goal:goals(*)
    `)
    .eq('celebrity_id', userProfile.celebrity_id)
    .in('status', ['approved', 'conversation_started'])
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching opportunities:', error)
    return []
  }

  return opportunities || []
} 