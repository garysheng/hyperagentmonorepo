import { SupabaseClient } from '@supabase/supabase-js'
import { createOpportunity } from '@/lib/opportunities'
import { TwitterDM } from '@/types/twitter'

interface CreateTwitterDMOpportunityParams {
  supabase: SupabaseClient;
  dm: TwitterDM;
  celebrity_id: string;
}

/**
 * Creates a new opportunity from a Twitter DM with proper defaults and ID generation
 */
export async function createTwitterDMOpportunity({
  supabase,
  dm,
  celebrity_id
}: CreateTwitterDMOpportunityParams) {
  return createOpportunity(supabase, {
    celebrity_id,
    source: 'TWITTER_DM',
    twitter_dm_conversation_id: dm.dm_conversation_id,
    twitter_dm_event_id: dm.id,
    twitter_sender_id: dm.sender.id,
    twitter_sender_username: dm.sender.username,
    initial_content: dm.text,
    sender_id: dm.sender.id,
    sender_handle: dm.sender.username
  })
} 