import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTwitterDMOpportunity } from '../opportunities'
import { createClient } from '@supabase/supabase-js'
import * as opportunitiesModule from '@/lib/opportunities'
import type { TwitterDMOpportunityData } from '@/lib/opportunities'

// Mock the base createOpportunity function
vi.mock('@/lib/opportunities', () => ({
  createOpportunity: vi.fn()
}))

// Mock Supabase client
const mockSupabase = {
  from: () => ({})
} as unknown as ReturnType<typeof createClient>

describe('createTwitterDMOpportunity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(opportunitiesModule.createOpportunity).mockResolvedValue({} as any)
  })

  it('should create an opportunity with provided IDs', async () => {
    const mockParams = {
      celebrity_id: 'celeb-123',
      conversation_id: 'conv-123',
      sender_username: 'testuser',
      message_content: 'Hello!',
      event_id: 'event-123',
      sender_id: 'sender-123'
    }

    await createTwitterDMOpportunity(mockSupabase, mockParams)

    expect(opportunitiesModule.createOpportunity).toHaveBeenCalledWith(
      mockSupabase,
      {
        celebrity_id: 'celeb-123',
        source: 'TWITTER_DM',
        twitter_dm_conversation_id: 'conv-123',
        twitter_dm_event_id: 'event-123',
        twitter_sender_id: 'sender-123',
        twitter_sender_username: 'testuser',
        initial_content: 'Hello!',
        sender_id: 'sender-123',
        sender_handle: 'testuser'
      } as TwitterDMOpportunityData
    )
  })

  it('should generate IDs when not provided', async () => {
    const mockParams = {
      celebrity_id: 'celeb-123',
      conversation_id: 'conv-123',
      sender_username: 'testuser',
      message_content: 'Hello!'
    }

    await createTwitterDMOpportunity(mockSupabase, mockParams)

    const call = vi.mocked(opportunitiesModule.createOpportunity).mock.calls[0][1] as TwitterDMOpportunityData
    
    // Verify required fields are present
    expect(call).toEqual(expect.objectContaining({
      celebrity_id: 'celeb-123',
      source: 'TWITTER_DM',
      twitter_dm_conversation_id: 'conv-123',
      twitter_sender_username: 'testuser',
      initial_content: 'Hello!',
      sender_handle: 'testuser'
    }))

    // Verify UUIDs were generated
    expect(call.twitter_dm_event_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(call.twitter_sender_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(call.sender_id).toBe(call.twitter_sender_id) // Should use same generated ID
  })
}) 