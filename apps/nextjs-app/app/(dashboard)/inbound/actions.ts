'use server'

import { createClient } from '@/utils/supabase/server'
import type { Opportunity } from '@/types'

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      goals (
        id,
        name,
        description
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching opportunities:', error)
    return []
  }

  return opportunities || []
} 