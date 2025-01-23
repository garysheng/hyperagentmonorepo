import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST } from '../generate-response/route';
import { createClient } from '@/lib/supabase/server';
import { responseGenerator } from '@/lib/ai/response-generator';
import { NextRequest } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/ai/response-generator', () => ({
  responseGenerator: {
    generateResponse: vi.fn()
  }
}));

interface MockSupabaseChain {
  select: Mock;
  eq: Mock;
  order: Mock;
  limit: Mock;
}

type MockSupabase = {
  from: Mock;
};

// Helper function to create NextRequest
function createNextRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/ai/generate-response', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

describe('Generate Response API', () => {
  let mockSupabase: MockSupabase;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock
    const mockChain: MockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          { content: 'Previous message 1', direction: 'inbound' },
          { content: 'Previous message 2', direction: 'outbound' }
        ],
        error: null
      })
    };

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockChain)
    };
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as SupabaseClient);
    vi.mocked(responseGenerator.generateResponse).mockResolvedValue('Generated response');
  });

  it('should generate a response for email with thread history', async () => {
    const req = createNextRequest({
      messageType: 'email',
      content: 'Test message',
      celebrityId: 'test-id',
      threadId: 'thread-123'
    });

    const response = await POST(req);
    const data = await response.json();

    // Verify Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith('email_messages');
    expect(mockSupabase.from().select).toHaveBeenCalledWith('content, direction');
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('thread_id', 'thread-123');

    // Verify response generator call
    expect(responseGenerator.generateResponse).toHaveBeenCalledWith({
      messageType: 'email',
      content: 'Test message',
      celebrityId: 'test-id',
      previousMessages: [
        { role: 'user', content: 'Previous message 1' },
        { role: 'assistant', content: 'Previous message 2' }
      ]
    });

    expect(data).toEqual({ response: 'Generated response' });
  });

  it('should generate a response for tweet with thread history', async () => {
    const req = createNextRequest({
      messageType: 'tweet',
      content: 'Test tweet',
      celebrityId: 'test-id',
      threadId: 'thread-123'
    });

    const response = await POST(req);
    const data = await response.json();

    // Verify Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith('opportunity_messages');
    expect(mockSupabase.from().select).toHaveBeenCalledWith('content, direction');
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('opportunity_id', 'thread-123');

    expect(data).toEqual({ response: 'Generated response' });
  });

  it('should handle existing previous messages', async () => {
    const req = createNextRequest({
      messageType: 'email',
      content: 'Test message',
      celebrityId: 'test-id',
      previousMessages: [
        { role: 'user', content: 'Existing message' }
      ]
    });

    const response = await POST(req);
    const data = await response.json();

    // Verify no Supabase calls were made
    expect(mockSupabase.from).not.toHaveBeenCalled();

    // Verify response generator call
    expect(responseGenerator.generateResponse).toHaveBeenCalledWith({
      messageType: 'email',
      content: 'Test message',
      celebrityId: 'test-id',
      previousMessages: [
        { role: 'user', content: 'Existing message' }
      ]
    });

    expect(data).toEqual({ response: 'Generated response' });
  });

  it('should handle validation errors', async () => {
    const req = createNextRequest({
      // Missing required fields
      content: 'Test message'
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should handle response generator errors', async () => {
    vi.mocked(responseGenerator.generateResponse).mockRejectedValue(new Error('Generation failed'));

    const req = createNextRequest({
      messageType: 'email',
      content: 'Test message',
      celebrityId: 'test-id'
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate response');
  });

  it('should combine thread history with existing messages', async () => {
    const req = createNextRequest({
      messageType: 'email',
      content: 'Test message',
      celebrityId: 'test-id',
      threadId: 'thread-123',
      previousMessages: [
        { role: 'user', content: 'Existing message' }
      ]
    });

    const response = await POST(req);
    await response.json();

    // Verify response generator received combined messages
    expect(responseGenerator.generateResponse).toHaveBeenCalledWith({
      messageType: 'email',
      content: 'Test message',
      celebrityId: 'test-id',
      previousMessages: [
        { role: 'user', content: 'Previous message 1' },
        { role: 'assistant', content: 'Previous message 2' },
        { role: 'user', content: 'Existing message' }
      ]
    });
  });
}); 