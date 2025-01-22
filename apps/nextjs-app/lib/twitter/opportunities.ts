import { SupabaseClient } from '@supabase/supabase-js'
import { createOpportunity } from '@/lib/opportunities'
import { randomUUID } from 'crypto'

interface CreateTwitterDMOpportunityParams {
  supabase: SupabaseClient;
  celebrity_id: string;
  dm_conversation_id: string;
  sender_username: string;
  message_text: string;
  sender_id?: string;
  event_id?: string;
}

/**
 * Creates a new opportunity from a Twitter DM with proper defaults and ID generation
 */
export async function createTwitterDMOpportunity({
  supabase,
  celebrity_id,
  dm_conversation_id,
  sender_username,
  message_text,
  sender_id,
  event_id
}: CreateTwitterDMOpportunityParams) {
  const finalSenderId = sender_id || randomUUID()
  const finalEventId = event_id || randomUUID()

  return createOpportunity(supabase, {
    celebrity_id,
    source: 'TWITTER_DM',
    twitter_dm_conversation_id: dm_conversation_id,
    twitter_dm_event_id: finalEventId,
    twitter_sender_id: finalSenderId,
    twitter_sender_username: sender_username,
    initial_content: message_text,
    sender_id: finalSenderId,
    sender_handle: sender_username
  })
} 