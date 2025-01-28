import { SupabaseClient } from '@supabase/supabase-js'
import { createOpportunity } from '../opportunities'
import { randomUUID } from 'crypto'

export interface CreateWidgetOpportunityInput {
  supabase: SupabaseClient,
  celebrityId: string
  message: string
  email: string
}

/**
 * Creates a new opportunity from a widget submission
 */
export async function createWidgetOpportunity(
  input: CreateWidgetOpportunityInput
) {
  const {
    supabase,
    celebrityId,
    message,
    email,
  } = input

  return createOpportunity(supabase, {
    celebrity_id: celebrityId,
    source: 'WIDGET',
    initial_content: message,
    sender_id: randomUUID(),
    sender_handle: email,
  })
}