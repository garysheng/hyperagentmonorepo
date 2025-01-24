import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email/mailgun';
import { TableName } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/email/mailgun', () => ({
  EmailService: vi.fn().mockImplementation(() => ({
    formatEmailAddress: vi.fn().mockReturnValue({
      email: 'test@example.com',
      formatted: 'Test Celebrity Team <test@example.com>'
    }),
    sendEmail: vi.fn().mockResolvedValue({ id: 'test-message-id' })
  }))
}));

// Define types for our mocks
type MockSupabaseMethods = {
  select: Mock;
  insert: Mock;
  update: Mock;
  eq: Mock;
  order: Mock;
  limit: Mock;
  single: Mock;
  maybeSingle: Mock;
};

type MockSupabaseClient = {
  from: Mock;
};

describe('Email Messages API Route', () => {
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a fresh mock for each test
    const mockMethods: MockSupabaseMethods = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null })
    };

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockMethods)
    };

    // Set up method chaining
    const mockFrom = mockSupabase.from() as MockSupabaseMethods;
    mockFrom.select.mockReturnValue(mockMethods);
    mockFrom.eq.mockReturnValue(mockMethods);
    mockFrom.order.mockReturnValue(mockMethods);
    mockFrom.limit.mockReturnValue(mockMethods);
    mockFrom.single.mockReturnValue(mockMethods);
    mockFrom.maybeSingle.mockReturnValue(mockMethods);

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as SupabaseClient);
  });

  it('should return 400 if opportunityId is missing', async () => {
    const request = new Request('http://localhost/api/messages/email', {
      method: 'POST',
      body: JSON.stringify({ message: 'test message' })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('opportunityId is required');
  });

  it('should return 400 if message is missing', async () => {
    const request = new Request('http://localhost/api/messages/email', {
      method: 'POST',
      body: JSON.stringify({ opportunityId: 'test-id' })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('message is required');
  });

  it('should handle sending a message to an existing thread', async () => {
    // Mock opportunity lookup
    (mockSupabase.from() as MockSupabaseMethods).single.mockResolvedValueOnce({
      data: {
        sender_handle: 'test@example.com',
        initial_content: 'Initial message',
        created_at: '2024-03-24T00:00:00Z',
        email_from: 'test@example.com',
        email_to: ['team@celebrity.hyperagent.so'],
        celebrity: {
          id: 'celebrity-123',
          celebrity_name: 'Test Celebrity'
        }
      }
    });

    // Mock existing thread lookup
    (mockSupabase.from() as MockSupabaseMethods).single.mockResolvedValueOnce({
      data: {
        id: 'thread-123',
        subject: 'Test Subject'
      }
    });

    // Mock message creation
    (mockSupabase.from() as MockSupabaseMethods).insert.mockResolvedValueOnce({ error: null });

    // Mock thread update
    (mockSupabase.from() as MockSupabaseMethods).update.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    // Mock opportunity status update
    (mockSupabase.from() as MockSupabaseMethods).update.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    const request = new Request('http://localhost/api/messages/email', {
      method: 'POST',
      body: JSON.stringify({
        opportunityId: 'opp-123',
        message: 'test message'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify opportunity lookup
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.OPPORTUNITIES);

    // Verify thread lookup
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.EMAIL_THREADS);

    // Get the mock instance
    const mockInstance = vi.mocked(EmailService).mock.results[0].value;

    // Verify email was sent
    expect(mockInstance.sendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      celebrityId: 'celebrity-123',
      celebrityName: 'Test Celebrity',
      subject: 'Re: Test Subject',
      text: 'test message',
      threadId: 'thread-123'
    });

    // Verify message was stored
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.EMAIL_MESSAGES);
    expect((mockSupabase.from() as MockSupabaseMethods).insert).toHaveBeenCalledWith({
      thread_id: 'thread-123',
      from_address: 'test@example.com',
      to_addresses: ['test@example.com'],
      subject: 'Re: Test Subject',
      content: 'test message',
      mailgun_message_id: 'test-message-id',
      direction: 'outbound',
      created_at: expect.any(String)
    });
  });

  it('should create a new thread when none exists', async () => {
    // Mock opportunity lookup
    (mockSupabase.from() as MockSupabaseMethods).single.mockResolvedValueOnce({
      data: {
        sender_handle: 'test@example.com',
        initial_content: 'Initial message',
        created_at: '2024-03-24T00:00:00Z',
        email_from: 'test@example.com',
        email_to: ['team@celebrity.hyperagent.so'],
        celebrity: {
          id: 'celebrity-123',
          celebrity_name: 'Test Celebrity'
        }
      }
    });

    // Mock no existing thread
    (mockSupabase.from() as MockSupabaseMethods).single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116' }
    });

    // Mock thread creation
    (mockSupabase.from() as MockSupabaseMethods).insert.mockResolvedValueOnce({ error: null });

    // Mock initial message creation
    (mockSupabase.from() as MockSupabaseMethods).insert.mockResolvedValueOnce({ error: null });

    // Mock outbound message creation
    (mockSupabase.from() as MockSupabaseMethods).insert.mockResolvedValueOnce({ error: null });

    // Mock thread update
    (mockSupabase.from() as MockSupabaseMethods).update.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    // Mock opportunity status update
    (mockSupabase.from() as MockSupabaseMethods).update.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    const request = new Request('http://localhost/api/messages/email', {
      method: 'POST',
      body: JSON.stringify({
        opportunityId: 'opp-123',
        message: 'First response'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify thread creation
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.EMAIL_THREADS);
    expect((mockSupabase.from() as MockSupabaseMethods).insert).toHaveBeenCalledWith({
      id: expect.any(String),
      opportunity_id: 'opp-123',
      subject: 'Response from Team',
      last_message_at: expect.any(String),
      status: 'active'
    });

    // Verify initial message was stored
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.EMAIL_MESSAGES);
    expect((mockSupabase.from() as MockSupabaseMethods).insert).toHaveBeenCalledWith({
      thread_id: expect.any(String),
      from_address: 'test@example.com',
      to_addresses: ['test@example.com'],
      subject: 'Initial Message',
      content: 'Initial message',
      direction: 'inbound',
      created_at: '2024-03-24T00:00:00Z'
    });

    // Verify outbound message was stored
    expect(mockSupabase.from).toHaveBeenCalledWith(TableName.EMAIL_MESSAGES);
    expect((mockSupabase.from() as MockSupabaseMethods).insert).toHaveBeenCalledWith({
      thread_id: expect.any(String),
      from_address: 'test@example.com',
      to_addresses: ['test@example.com'],
      subject: 'Response from Team',
      content: 'First response',
      mailgun_message_id: 'test-message-id',
      direction: 'outbound',
      created_at: expect.any(String)
    });
  });

  it('should handle missing celebrity data', async () => {
    // Mock opportunity lookup without celebrity data
    (mockSupabase.from() as MockSupabaseMethods).single.mockResolvedValueOnce({
      data: {
        sender_handle: 'test@example.com',
        initial_content: 'Initial message',
        created_at: '2024-03-24T00:00:00Z',
        email_from: 'test@example.com',
        email_to: ['team@celebrity.hyperagent.so'],
        celebrity: null
      }
    });

    const request = new Request('http://localhost/api/messages/email', {
      method: 'POST',
      body: JSON.stringify({
        opportunityId: 'opp-123',
        message: 'Test message'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Celebrity data not found for opportunity: opp-123');
  });

  it('should handle invalid recipient email', async () => {
    // Mock opportunity lookup with invalid email
    (mockSupabase.from() as MockSupabaseMethods).single.mockResolvedValueOnce({
      data: {
        sender_handle: 'invalid-email',
        initial_content: 'Initial message',
        created_at: '2024-03-24T00:00:00Z',
        email_from: null,
        email_to: null,
        celebrity: {
          id: 'celebrity-123',
          celebrity_name: 'Test Celebrity'
        }
      }
    });

    const request = new Request('http://localhost/api/messages/email', {
      method: 'POST',
      body: JSON.stringify({
        opportunityId: 'opp-123',
        message: 'Test message'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Valid recipient email address is missing');
  });
}); 