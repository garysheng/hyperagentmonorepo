import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Define types for our mocks
type MockSupabaseMethods = {
  select: Mock;
  insert: Mock;
  update: Mock;
  eq: Mock;
  order: Mock;
  limit: Mock;
  single: Mock;
};

type MockSupabaseClient = {
  from: Mock<[], MockSupabaseMethods>;
};

describe('Thread API Route', () => {
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a fresh mock for each test with all required methods
    const mockMethods: MockSupabaseMethods = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null })
    };

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockMethods)
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as SupabaseClient);
  });

  it('should return 400 if opportunityId is missing', async () => {
    const req = new NextRequest('http://localhost/api/messages/thread');
    const response = await GET(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Opportunity ID is required');
  });

  it('should return 404 if no thread is found', async () => {
    // Mock no thread found
    mockSupabase.from().single.mockResolvedValueOnce({ data: null, error: null });

    const req = new NextRequest('http://localhost/api/messages/thread?opportunityId=test-123');
    const response = await GET(req);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Thread not found');
  });

  it('should return thread and messages if found', async () => {
    const mockThread = {
      id: 'thread-123',
      subject: 'Test Thread'
    };

    const mockMessages = [
      {
        id: 'msg-1',
        thread_id: 'thread-123',
        content: 'Test message 1',
        created_at: new Date().toISOString()
      },
      {
        id: 'msg-2',
        thread_id: 'thread-123',
        content: 'Test message 2',
        created_at: new Date().toISOString()
      }
    ];

    // Mock thread found
    mockSupabase.from().single.mockResolvedValueOnce({ 
      data: mockThread,
      error: null 
    });

    // Mock messages found
    mockSupabase.from().select().mockResolvedValueOnce({
      data: mockMessages,
      error: null
    });

    const req = new NextRequest('http://localhost/api/messages/thread?opportunityId=test-123');
    const response = await GET(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.thread).toEqual(mockThread);
    expect(data.messages).toEqual(mockMessages);
  });

  it('should handle thread fetch error', async () => {
    // Mock thread fetch error
    mockSupabase.from().single.mockResolvedValueOnce({ 
      data: null,
      error: { message: 'Database error' }
    });

    const req = new NextRequest('http://localhost/api/messages/thread?opportunityId=test-123');
    const response = await GET(req);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch thread');
  });

  it('should handle messages fetch error', async () => {
    // Mock thread found but messages fetch error
    mockSupabase.from().single.mockResolvedValueOnce({ 
      data: { id: 'thread-123', subject: 'Test Thread' },
      error: null 
    });

    mockSupabase.from().select().mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' }
    });

    const req = new NextRequest('http://localhost/api/messages/thread?opportunityId=test-123');
    const response = await GET(req);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch messages');
  });
}); 