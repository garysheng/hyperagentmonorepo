import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResponseGenerator } from '../response-generator';
import { createClient } from '@/lib/supabase/server';
import { Client as LangSmithClient } from 'langsmith';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('langsmith');

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ResponseGenerator', () => {
  let responseGenerator: ResponseGenerator;
  let mockSupabase: SupabaseClient;
  let mockLangSmith: LangSmithClient;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup Supabase mock
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { celebrity_name: 'Test Celebrity' },
        error: null
      })
    };

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockChain)
    } as unknown as SupabaseClient;
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase);

    // Setup fetch mock default response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Test response' } }]
      })
    });

    // Setup LangSmith mock
    mockLangSmith = {
      createRun: vi.fn().mockResolvedValue({ id: 'test-run-id' })
    } as any;
    (LangSmithClient as any).mockImplementation(() => mockLangSmith);

    responseGenerator = new ResponseGenerator();
  });

  it('should generate a response for email', async () => {
    const options = {
      messageType: 'email' as const,
      content: 'Test message',
      celebrityId: 'test-id',
      previousMessages: [
        { role: 'user' as const, content: 'Previous message' }
      ]
    };

    const response = await responseGenerator.generateResponse(options);

    // Verify Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith('celebrities');
    expect(mockSupabase.from).toHaveBeenCalledWith('goals');

    // Verify Deepseek API call
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer')
        }),
        body: expect.stringContaining('You are an AI assistant')
      })
    );

    // Verify LangSmith call
    expect(mockLangSmith.createRun).toHaveBeenCalledWith(expect.objectContaining({
      name: 'generate_response',
      run_type: 'chain',
      inputs: expect.objectContaining({
        messageType: 'email',
        content: 'Test message'
      })
    }));

    expect(response).toBe('Test response');
  });

  it('should throw error if celebrity not found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null
      })
    };

    mockSupabase.from = vi.fn().mockReturnValue(mockChain);

    const options = {
      messageType: 'email' as const,
      content: 'Test message',
      celebrityId: 'test-id'
    };

    await expect(responseGenerator.generateResponse(options))
      .rejects
      .toThrow('Celebrity not found');
  });

  it('should handle Supabase errors', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    };

    mockSupabase.from = vi.fn().mockReturnValue(mockChain);

    const options = {
      messageType: 'email' as const,
      content: 'Test message',
      celebrityId: 'test-id'
    };

    await expect(responseGenerator.generateResponse(options))
      .rejects
      .toThrow('Failed to fetch celebrity details: Database error');
  });

  it('should generate a response for Twitter DM', async () => {
    const options = {
      messageType: 'tweet' as const,
      content: 'Test tweet',
      celebrityId: 'test-id'
    };

    const response = await responseGenerator.generateResponse(options);

    // Verify the API call includes Twitter context
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/v1/chat/completions',
      expect.objectContaining({
        body: expect.stringContaining('This is a Twitter DM conversation')
      })
    );

    expect(response).toBe('Test response');
  });

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'API error' } })
    });

    const options = {
      messageType: 'email' as const,
      content: 'Test message',
      celebrityId: 'test-id'
    };

    await expect(responseGenerator.generateResponse(options))
      .rejects
      .toThrow('Failed to generate response');
  });
}); 