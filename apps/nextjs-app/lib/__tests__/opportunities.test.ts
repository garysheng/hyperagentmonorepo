import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createOpportunity } from '../opportunities'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

const mockSupabase = {
  from: () => ({
    insert: mockInsert,
    select: mockSelect,
    single: mockSingle
  })
} as unknown as ReturnType<typeof createClient>

describe('createOpportunity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
  })

  describe('Twitter DM opportunities', () => {
    it('should create a Twitter DM opportunity with required fields', async () => {
      const mockOpportunity = {
        id: 'test-id',
        celebrity_id: 'celeb-123',
        source: 'TWITTER_DM',
        status: 'pending',
        twitter_dm_conversation_id: 'conv-123',
        twitter_dm_event_id: 'event-123',
        twitter_sender_id: 'sender-123',
        twitter_sender_username: 'testuser',
        initial_content: 'Hello!',
        sender_id: 'sender-123',
        sender_handle: 'testuser',
        relevance_score: -1,
        tags: [],
        needs_discussion: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSingle.mockResolvedValue({ data: mockOpportunity, error: null })

      const result = await createOpportunity(mockSupabase, {
        celebrity_id: 'celeb-123',
        source: 'TWITTER_DM',
        twitter_dm_conversation_id: 'conv-123',
        twitter_dm_event_id: 'event-123',
        twitter_sender_id: 'sender-123',
        twitter_sender_username: 'testuser',
        initial_content: 'Hello!',
        sender_id: 'sender-123',
        sender_handle: 'testuser'
      })

      expect(result).toEqual(mockOpportunity)
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        celebrity_id: 'celeb-123',
        source: 'TWITTER_DM',
        status: 'pending',
        twitter_dm_conversation_id: 'conv-123',
        twitter_dm_event_id: 'event-123',
        twitter_sender_id: 'sender-123',
        twitter_sender_username: 'testuser',
        initial_content: 'Hello!',
        sender_id: 'sender-123',
        sender_handle: 'testuser',
        relevance_score: -1,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }))
    })

    it('should throw an error if Supabase insert fails', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: new Error('Database error') 
      })

      await expect(createOpportunity(mockSupabase, {
        celebrity_id: 'celeb-123',
        source: 'TWITTER_DM',
        twitter_dm_conversation_id: 'conv-123',
        twitter_dm_event_id: 'event-123',
        twitter_sender_id: 'sender-123',
        twitter_sender_username: 'testuser',
        initial_content: 'Hello!',
        sender_id: 'sender-123',
        sender_handle: 'testuser'
      })).rejects.toThrow('Database error')
    })
  })

  describe('Widget opportunities', () => {
    it('should create a widget opportunity with required fields', async () => {
      const mockOpportunity = {
        id: 'test-id',
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        status: 'pending',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'John Doe',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        relevance_score: -1,
        tags: [],
        needs_discussion: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSingle.mockResolvedValue({ data: mockOpportunity, error: null })

      const result = await createOpportunity(mockSupabase, {
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'John Doe',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      })

      expect(result).toEqual(mockOpportunity)
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        status: 'pending',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'John Doe',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        relevance_score: -1,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }))
    })

    it('should create a widget opportunity with minimal fields', async () => {
      const mockOpportunity = {
        id: 'test-id',
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        status: 'pending',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'Anonymous',
        relevance_score: -1,
        tags: [],
        needs_discussion: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSingle.mockResolvedValue({ data: mockOpportunity, error: null })

      const result = await createOpportunity(mockSupabase, {
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'Anonymous'
      })

      expect(result).toEqual(mockOpportunity)
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        status: 'pending',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'Anonymous',
        relevance_score: -1,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }))
    })
  })

  describe('Status handling', () => {
    it('should use provided status if specified', async () => {
      const mockOpportunity = {
        id: 'test-id',
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        status: 'approved',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'Anonymous',
        relevance_score: -1,
        tags: [],
        needs_discussion: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSingle.mockResolvedValue({ data: mockOpportunity, error: null })

      await createOpportunity(mockSupabase, {
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        status: 'approved',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'Anonymous'
      })

      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        status: 'approved',
        relevance_score: -1,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }))
    })

    it('should default to pending status', async () => {
      const mockOpportunity = {
        id: 'test-id',
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        status: 'pending',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'Anonymous',
        relevance_score: -1,
        tags: [],
        needs_discussion: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSingle.mockResolvedValue({ data: mockOpportunity, error: null })

      await createOpportunity(mockSupabase, {
        celebrity_id: 'celeb-123',
        source: 'WIDGET',
        initial_content: 'Hello!',
        sender_id: 'widget-123',
        sender_handle: 'Anonymous'
      })

      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        status: 'pending',
        relevance_score: -1,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }))
    })
  })
}) 