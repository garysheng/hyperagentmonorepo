import { NextRequest } from 'next/server'
import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/server')

describe('POST /api/opportunities/apply-transcript', () => {
  const mockUser = { id: 'test-user-id' }
  const mockOpportunity = {
    id: 'test-opportunity-id',
    status: 'pending'
  }

  const validRequestBody = {
    opportunityId: mockOpportunity.id,
    transcript: 'Test transcript',
    proposedStatus: 'approved',
    summary: 'Test summary',
    actionRecap: 'Test action recap'
  }

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should successfully update an opportunity', async () => {
    // Mock Supabase responses
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } })
      },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })
    }
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase)

    // Create request
    const request = new NextRequest('http://localhost/api/opportunities/apply-transcript', {
      method: 'POST',
      body: JSON.stringify(validRequestBody)
    })

    // Call endpoint
    const response = await POST(request)
    const data = await response.json()

    // Verify response
    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })

    // Verify Supabase calls
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith('opportunities')
    expect(mockSupabase.from().update).toHaveBeenCalledWith({
      status: validRequestBody.proposedStatus,
      meeting_note_transcript: validRequestBody.transcript,
      meeting_note_summary: validRequestBody.summary,
      meeting_note_action_recap: validRequestBody.actionRecap,
      meeting_note_processed_at: expect.any(String),
      meeting_note_processed_by: mockUser.id,
      needs_discussion: false
    })
  })

  it('should return 400 if required fields are missing', async () => {
    const invalidBody = {
      opportunityId: mockOpportunity.id,
      // Missing required fields
    }

    const request = new NextRequest('http://localhost/api/opportunities/apply-transcript', {
      method: 'POST',
      body: JSON.stringify(invalidBody)
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Missing required fields')
  })

  it('should return 401 if user is not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } })
      }
    }
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase)

    const request = new NextRequest('http://localhost/api/opportunities/apply-transcript', {
      method: 'POST',
      body: JSON.stringify(validRequestBody)
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('should return 500 if database update fails', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } })
      },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: new Error('Database error') })
        })
      })
    }
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase)

    const request = new NextRequest('http://localhost/api/opportunities/apply-transcript', {
      method: 'POST',
      body: JSON.stringify(validRequestBody)
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Failed to update opportunity')
  })

  it('should return 500 for invalid request body', async () => {
    const request = new NextRequest('http://localhost/api/opportunities/apply-transcript', {
      method: 'POST',
      body: 'invalid json'
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Server Error')
  })
}) 