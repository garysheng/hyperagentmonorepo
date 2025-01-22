import { SupabaseClient } from '@supabase/supabase-js'
import { createOpportunity } from '@/lib/opportunities'
import { randomUUID } from 'crypto'

interface CreateTwitterDMOpportunityParams {
  supabase: SupabaseClient;
  celebrity_id: string;
  dm_conversation_id: string;
  sender_username: string;
  message_text: string;
}

/**
 * Creates a new opportunity from a Twitter DM with proper defaults and ID generation
 */
export async function createTwitterDMOpportunity({
  supabase,
  celebrity_id,
  dm_conversation_id,
  sender_username,
  message_text
}: CreateTwitterDMOpportunityParams) {
  const sender_id = randomUUID()
  return createOpportunity(supabase, {
    celebrity_id,
    source: 'TWITTER_DM',
    twitter_dm_conversation_id: dm_conversation_id,
    twitter_dm_event_id: dm_conversation_id, // Using conversation_id as event_id for manual entries
    twitter_sender_id: sender_id,
    twitter_sender_username: sender_username,
    initial_content: message_text,
    sender_id,
    sender_handle: sender_username
  })
} 