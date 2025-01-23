import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { ResponseGenerator } from '../response-generator';
import path from 'path';
import { config } from 'dotenv';
import { WritingStyle } from '@/types';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../../.env.local');
config({ path: envPath });

const mockWritingStyle: WritingStyle = {
  id: 'test-id',
  celebrity_id: 'test-celebrity-id',
  formality_level: 80,
  enthusiasm_level: 60,
  directness_level: 70,
  humor_level: 30,
  sentence_length_preference: 60,
  vocabulary_complexity: 70,
  technical_language_level: 80,
  emoji_usage_level: 20,
  preferred_phrases: ['cutting-edge technology', 'innovative solutions'],
  avoided_phrases: ['basic', 'simple'],
  preferred_greetings: ['Greetings', 'Hello'],
  preferred_signoffs: ['Best regards', 'Looking forward to our collaboration'],
  voice_examples: [
    {
      context: 'professional',
      content: 'I\'m excited to explore how our expertise in AI can drive meaningful innovation in your project.'
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'system',
  last_updated_by: 'system'
};

// Mock the Supabase client
let currentWritingStyle = mockWritingStyle;

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            // Return different data based on the table being queried
            if (table === 'celebrities') {
              return {
                data: { celebrity_name: 'Test Celebrity' },
                error: null
              };
            }
            if (table === 'writing_styles') {
              return {
                data: currentWritingStyle,
                error: null
              };
            }
            return { data: null, error: null };
          },
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

  beforeEach(() => {
    // Reset to default writing style before each test
    currentWritingStyle = mockWritingStyle;
  });

  it('should generate a formal, technical email response', async () => {
    const options = {
      messageType: 'email' as const,
      content: 'Hi, I\'m interested in collaborating on a new AI-driven podcast series. Would you be interested in being a guest?',
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
    expect(response.length).toBeGreaterThan(50);
    
    // Check for writing style adherence
    expect(response).toMatch(/Greetings|Hello/i); // Should use preferred greetings
    expect(response).toMatch(/Best regards|Looking forward to our collaboration/i); // Should use preferred sign-offs
    expect(response).toMatch(/cutting-edge technology|innovative solutions/i); // Should use preferred phrases
    expect(response).not.toMatch(/\b(basic|simple)\b/i); // Should avoid specified phrases
    expect(response.split('.').some(s => s.length > 50)); // Should have some longer sentences
    
    // Check for formal and professional tone
    const formalIndicators = [
      /\b(would|could|shall|may|might|consider|discuss|explore|opportunity|collaboration)\b/i,
      /\b(specific|details|provide|regarding|further|inquire)\b/i
    ];
    expect(formalIndicators.some(pattern => pattern.test(response))).toBe(true);
  }, 30000);

  it('should generate a concise Twitter DM response with appropriate style', async () => {
    const options = {
      messageType: 'tweet' as const,
      content: 'Would love to have you speak at our tech conference about AI!',  // Shortened content
      celebrityId: 'test-id'
    };

    const response = await responseGenerator.generateResponse(options);

    // Verify response structure and content
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
    expect(response.length).toBeLessThan(280); // Twitter character limit
    
    // Check for writing style adherence
    expect(response).toMatch(/cutting-edge|innovative/i); // Should use preferred phrases
    expect(response).not.toMatch(/\b(basic|simple)\b/i); // Should avoid specified phrases
    
    // Check for Twitter-appropriate formatting
    expect(response.split('.').every(s => s.trim().length < 100)); // Should have shorter sentences
    expect(response.split('\n').length).toBeLessThan(4); // Should be concise
    
    // Check for appropriate enthusiasm level (60/100 in mock)
    const enthusiasmIndicators = [
      /\b(interested|excited|looking forward|great|excellent)\b/i,
      /\b(would love|happy to|pleased to)\b/i
    ];
    expect(enthusiasmIndicators.some(pattern => pattern.test(response))).toBe(true);
  }, 30000);

  it('should adapt tone based on writing style settings', async () => {
    // Update the current writing style to casual
    currentWritingStyle = {
      ...mockWritingStyle,
      formality_level: 30,
      enthusiasm_level: 90,
      humor_level: 70,
      emoji_usage_level: 80,
      vocabulary_complexity: 30,
      preferred_phrases: ['awesome', 'super excited'],
      preferred_greetings: ['Hey there!', 'Hi!'],
      preferred_signoffs: ['Cheers!', 'Talk soon!']
    };

    const options = {
      messageType: 'email' as const,
      content: 'Hey! Can you tell me more about your experience with AI?',
      celebrityId: 'test-id'
    };

    const response = await responseGenerator.generateResponse(options);

    // Verify tone adaptation
    expect(response).toBeTruthy();
    expect(response).toMatch(/Hey there!|Hi!/i); // Should use casual greetings
    expect(response).toMatch(/awesome|super excited/i); // Should use casual phrases
    expect(response).toMatch(/Cheers!|Talk soon!/i); // Should use casual sign-offs
    
    // Check for high enthusiasm (90/100)
    const highEnthusiasmIndicators = [
      /!/,  // Exclamation marks
      /\b(love|excited|amazing|fantastic|absolutely)\b/i,
      /[😊🚀💡]/  // Emojis (high emoji_usage_level)
    ];
    expect(highEnthusiasmIndicators.some(pattern => pattern.test(response))).toBe(true);
    
    // Check for casual language (low formality)
    const casualIndicators = [
      /\b(yeah|sure|great|awesome|cool)\b/i,
      /\b(let's|that's|it's)\b/i  // Contractions
    ];
    expect(casualIndicators.some(pattern => pattern.test(response))).toBe(true);
    
    // Check for simpler sentence structure
    expect(response.split('.').every(s => s.trim().length < 80));
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
    
    // Check for topic continuity
    expect(response).toMatch(/conference|keynote|fee|speaking/i);
    expect(response).toMatch(/AI|machine learning/i);
    
    // Check for context-aware details
    const contextualIndicators = [
      /\b(3.?day|event|conference)\b/i,  // References to the event details
      /\b(30.?minute|keynote)\b/i,       // References to the specific request
      /\b(previous|discussed|mentioned)\b/i  // References to previous conversation
    ];
    expect(contextualIndicators.some(pattern => pattern.test(response))).toBe(true);
    
    // Verify writing style is maintained
    expect(response).toMatch(/cutting-edge technology|innovative solutions/i);
    expect(response).not.toMatch(/\b(basic|simple)\b/i);
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
    
    // Check that all topics are addressed
    const topics = [
      /\b(podcast|appearance|episode|show)\b/i,
      /\b(investment|startup|venture)\b/i,
      /\b(speaking|conference|engagement|event)\b/i
    ];
    const addressedTopics = topics.filter(pattern => pattern.test(response));
    expect(addressedTopics.length).toBeGreaterThan(2); // Should address at least 2 topics
    
    // Check for structured response
    expect(response.length).toBeGreaterThan(100);
    
    // Verify professional tone is maintained
    expect(response).toMatch(/cutting-edge technology|innovative solutions/i);
    expect(response).not.toMatch(/\b(basic|simple)\b/i);
    
    // Check for organized response structure
    const structureIndicators = [
      /\b(regarding|concerning|about)\b/i,
      /\b(first|second|third|finally|additionally)\b/i,
      /\b(all|each|both|these opportunities)\b/i
    ];
    expect(structureIndicators.some(pattern => pattern.test(response))).toBe(true);
  }, 30000);
}); 