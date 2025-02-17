import { SupabaseClient } from '@supabase/supabase-js'
import { OpportunityStatus } from '@/types'

interface BaseOpportunityData {
  celebrity_id: string
  initial_content: string
  sender_id: string
  sender_handle: string
  status?: OpportunityStatus
  created_at?: string
  updated_at?: string
}

export interface TwitterDMOpportunityData extends BaseOpportunityData {
  source: 'TWITTER_DM'
  twitter_dm_conversation_id: string
  twitter_dm_event_id: string
  twitter_sender_id: string
  twitter_sender_username: string
}

interface WidgetOpportunityData extends BaseOpportunityData {
  source: 'WIDGET'
  email?: string
  name?: string
  phone?: string
}

type OpportunityData = TwitterDMOpportunityData | WidgetOpportunityData

function getDefaultStatus(source: OpportunityData['source']): OpportunityStatus {
  switch (source) {
    case 'TWITTER_DM':
      return 'pending'
    case 'WIDGET':
      return 'pending'
    default:
      return 'pending'
  }
}

export async function createOpportunity(
  supabase: SupabaseClient,
  data: OpportunityData
) {
  // Set default values
  const now = new Date().toISOString()
  const opportunityData = {
    ...data,
    status: data.status || getDefaultStatus(data.source),
    created_at: data.created_at || now,
    updated_at: data.updated_at || now,
    relevance_score: -1 // Set initial relevance score to -1 for classification
  }

  const { data: opportunity, error } = await supabase
    .from('opportunities')
    .insert(opportunityData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return opportunity
} 