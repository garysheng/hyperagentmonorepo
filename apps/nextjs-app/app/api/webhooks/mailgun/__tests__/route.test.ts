import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { TableName } from '@/types';
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
  is: Mock;
};

type MockSupabaseClient = {
  from: Mock<[], MockSupabaseMethods>;
};

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('crypto', () => ({
  default: {
    createHmac: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('7536e0dd9c8b2d16f1d1a6a3c2c4a5b6c7d8e9f0')
    })
  }
}));

describe('Mailgun Webhook Handler', () => {
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
      single: vi.fn().mockResolvedValue({ data: null }),
      is: vi.fn().mockReturnThis()
    };

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockMethods)
    };

    // Set up method chaining for specific operations
    const mockFrom = mockSupabase.from();

    // For opportunity lookup
    mockFrom.select.mockReturnValue(mockMethods);
    mockFrom.eq.mockReturnValue(mockMethods);
    mockFrom.order.mockReturnValue(mockMethods);
    mockFrom.limit.mockReturnValue(mockMethods);

    // For thread creation
    mockFrom.insert.mockReturnValue({
      ...mockMethods,
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'new-thread-123' } })
      })
    });

    // For message creation
    mockFrom.insert.mockReturnValue({
      error: null
    });

    // For status update
    mockFrom.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as SupabaseClient);
    process.env.MAILGUN_SIGNING_KEY = 'test-signing-key';
  });

  const createFormData = (data: Record<string, string>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  };

  const mockValidWebhookData = {
    timestamp: '1234567890',
    token: 'test-token',
    signature: '7536e0dd9c8b2d16f1d1a6a3c2c4a5b6c7d8e9f0',
    sender: 'test@example.com',
    subject: 'Test Subject',
    'body-plain': 'Test message body',
    'stripped-text': 'Stripped test message',
    'Message-Id': '<test123@mailgun.org>',
  };

  it('should return 500 if MAILGUN_SIGNING_KEY is not configured', async () => {
    process.env.MAILGUN_SIGNING_KEY = '';
    
    const req = new NextRequest('http://localhost/api/webhooks/mailgun', {
      method: 'POST',
      body: createFormData(mockValidWebhookData),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Configuration error');
  });

  it('should handle a valid webhook request and create a message', async () => {
    // Mock existing opportunity
    mockSupabase.from().single
      .mockResolvedValueOnce({ 
        data: { 
          id: 'opp-123', 
          status: 'new',
          source: 'WIDGET'
        } 
      })
      .mockResolvedValueOnce({ 
        data: { 
          id: 'thread-123' 
        } 
      });

    // Mock message creation
    mockSupabase.from().insert.mockResolvedValueOnce({ error: null });

    // Mock status update
    mockSupabase.from().update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    const req = new NextRequest('http://localhost/api/webhooks/mailgun', {
      method: 'POST',
      body: createFormData(mockValidWebhookData),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    
    // Verify opportunity lookup
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.OPPORTUNITIES);
    
    // Verify message creation
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.EMAIL_MESSAGES);
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      thread_id: 'thread-123',
      opportunity_id: 'opp-123',
      content: 'Stripped test message',
      direction: 'inbound',
      external_id: '<test123@mailgun.org>',
    });
  });

  it('should create a new thread if none exists', async () => {
    // Mock existing opportunity but no thread
    mockSupabase.from().single
      .mockResolvedValueOnce({ 
        data: { 
          id: 'opp-123', 
          status: 'new',
          source: 'WIDGET'
        } 
      })
      .mockResolvedValueOnce({ 
        data: null 
      });

    // Mock thread creation with proper chaining
    const mockThreadInsert = {
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ 
          data: { 
            id: 'new-thread-123' 
          },
          error: null
        })
      })
    };
    mockSupabase.from().insert.mockReturnValue(mockThreadInsert);

    // Mock message creation
    const mockMessageInsert = { error: null };
    mockSupabase.from().insert
      .mockReturnValueOnce(mockThreadInsert)  // First call for thread
      .mockReturnValueOnce(mockMessageInsert); // Second call for message

    // Mock status update
    mockSupabase.from().update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    const req = new NextRequest('http://localhost/api/webhooks/mailgun', {
      method: 'POST',
      body: createFormData(mockValidWebhookData),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    // Verify thread creation
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.EMAIL_THREADS);
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      opportunity_id: 'opp-123',
      subject: 'Test Subject',
    });
  });

  it('should return 404 if no opportunity exists for the sender', async () => {
    // Mock no existing opportunity
    mockSupabase.from().single.mockResolvedValueOnce({ data: null });

    const req = new NextRequest('http://localhost/api/webhooks/mailgun', {
      method: 'POST',
      body: createFormData(mockValidWebhookData),
    });

    const response = await POST(req);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Opportunity not found');
  });

  it('should handle errors during message creation', async () => {
    // Mock existing opportunity and thread
    mockSupabase.from().single
      .mockResolvedValueOnce({ 
        data: { 
          id: 'opp-123', 
          status: 'new',
          source: 'WIDGET'
        } 
      })
      .mockResolvedValueOnce({ 
        data: { 
          id: 'thread-123' 
        } 
      });

    // Mock message creation error
    mockSupabase.from().insert.mockResolvedValueOnce({ error: { message: 'Database error' } });

    const req = new NextRequest('http://localhost/api/webhooks/mailgun', {
      method: 'POST',
      body: createFormData(mockValidWebhookData),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to create message');
  });
}); 