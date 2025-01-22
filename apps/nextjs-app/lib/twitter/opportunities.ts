import { SupabaseClient } from '@supabase/supabase-js'
import { createOpportunity } from '@/lib/opportunities'

interface CreateTwitterDMOpportunityParams {
  celebrity_id: string
  conversation_id: string
  sender_username: string
  message_content: string
  event_id?: string // Optional - will generate if not provided
  sender_id?: string // Optional - will generate if not provided
}

/**
 * Creates a new opportunity from a Twitter DM with proper defaults and ID generation
 */
export async function createTwitterDMOpportunity(
  supabase: SupabaseClient,
  params: CreateTwitterDMOpportunityParams
) {
  // Generate UUIDs if not provided
  const sender_id = params.sender_id || generateUUID()
  const event_id = params.event_id || generateUUID()

  return createOpportunity(supabase, {
    celebrity_id: params.celebrity_id,
    source: 'TWITTER_DM',
    twitter_dm_conversation_id: params.conversation_id,
    twitter_dm_event_id: event_id,
    twitter_sender_id: sender_id,
    twitter_sender_username: params.sender_username,
    initial_content: params.message_content,
    sender_id: sender_id,
    sender_handle: params.sender_username
  })
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
} 