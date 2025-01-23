import { describe, it, expect, beforeAll, vi } from 'vitest';
import { ResponseGenerator } from '../response-generator';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../../.env.local');
config({ path: envPath });

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { celebrity_name: 'Test Celebrity' },
            error: null
          }),
          order: () => ({
            data: [
              { name: 'Goal 1', description: 'Description 1' },
              { name: 'Goal 2', description: 'Description 2' }
            ],
            error: null
          })
        })
      })
    })
  })
}));

// Debug environment variables
console.log('\nTest Environment Variables:');
console.log('DEEPSEEK_API_KEY exists:', !!process.env.DEEPSEEK_API_KEY);
console.log('DEEPSEEK_API_KEY length:', process.env.DEEPSEEK_API_KEY?.length);

// Skip these tests if required environment variables are not set
const shouldRunIntegrationTests = process.env.DEEPSEEK_API_KEY;

describe.runIf(shouldRunIntegrationTests)('ResponseGenerator Integration Tests', () => {
  let responseGenerator: ResponseGenerator;

  beforeAll(() => {
    responseGenerator = new ResponseGenerator();
  });

  it('should generate a coherent email response', async () => {
    const options = {
      messageType: 'email' as const,
      content: 'Hi, I\'m interested in collaborating on a new podcast series. Would you be interested in being a guest?',
      celebrityId: 'test-id',
      previousMessages: [
        { role: 'user' as const, content: 'Initial inquiry about podcast collaboration' },
        { role: 'assistant' as const, content: 'Thank you for reaching out! Could you tell me more about your podcast?' }
      ]
    };

    const response = await responseGenerator.generateResponse(options);

    // Verify response structure and content
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(50); // Should be a substantial response
    expect(response).toMatch(/podcast|collaboration|interest/i); // Should mention key topics
  }, 30000); // Increase timeout for API calls

  it('should generate a concise Twitter DM response', async () => {
    const options = {
      messageType: 'tweet' as const,
      content: 'Would love to have you speak at our tech conference next month!',
      celebrityId: 'test-id'
    };

    const response = await responseGenerator.generateResponse(options);

    // Verify response structure and content
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
    expect(response.length).toBeLessThan(280); // Twitter character limit
    expect(response).toMatch(/conference|speak|event/i); // Should mention key topics
  }, 30000);

  it('should maintain conversation context across multiple messages', async () => {
    const options = {
      messageType: 'email' as const,
      content: 'What\'s your fee for a 30-minute keynote?',
      celebrityId: 'test-id',
      previousMessages: [
        { role: 'user' as const, content: 'Hi, I\'d like to book you for our annual tech conference.' },
        { role: 'assistant' as const, content: 'Thank you for considering me! I\'d be happy to learn more about your conference.' },
        { role: 'user' as const, content: 'It\'s a 3-day event focused on AI and machine learning.' },
        { role: 'assistant' as const, content: 'That sounds fascinating! AI and ML are definitely areas I\'m passionate about.' }
      ]
    };

    const response = await responseGenerator.generateResponse(options);

    // Verify response maintains context
    expect(response).toBeTruthy();
    expect(response).toMatch(/conference|keynote|fee|speaking/i);
    expect(response).toMatch(/AI|machine learning/i); // Should remember the conference topic
  }, 30000);

  it('should handle complex inquiries with multiple topics', async () => {
    const options = {
      messageType: 'email' as const,
      content: 'We\'d love to discuss: 1) A podcast appearance 2) A potential investment in our AI startup 3) A speaking engagement at our annual conference. Which of these interests you most?',
      celebrityId: 'test-id'
    };

    const response = await responseGenerator.generateResponse(options);

    // Verify response addresses multiple topics
    expect(response).toBeTruthy();
    expect(response).toMatch(/podcast|investment|speaking|conference/i);
    expect(response.length).toBeGreaterThan(100); // Should be detailed enough to address multiple points
  }, 30000);
}); 