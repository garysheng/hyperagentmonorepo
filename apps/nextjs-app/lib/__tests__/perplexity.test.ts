import { PerplexityAI } from '../perplexity';
import { describe, it, expect, beforeAll } from 'vitest';

// Load environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY environment variable is required for tests');
}

describe('PerplexityAI', () => {
  let perplexityAI: PerplexityAI;

  beforeAll(() => {
    perplexityAI = new PerplexityAI(PERPLEXITY_API_KEY);
  });

  const mockGoals = [
    {
      id: '1',
      name: 'Sponsorships',
      description: 'Brand deals and sponsorship opportunities worth over $50k'
    },
    {
      id: '2',
      name: 'Speaking Engagements',
      description: 'Conference talks and keynote speaking opportunities'
    },
    {
      id: '3',
      name: 'Charity Collaborations',
      description: 'Opportunities to work with non-profits and charitable organizations'
    }
  ];

  it('should classify a highly relevant sponsorship opportunity', async () => {
    const content = 'Hi, I\'m from Nike. We\'d love to discuss a potential $500k sponsorship deal for our new product line.';
    
    const result = await perplexityAI.classifyOpportunity(content, mockGoals);
    
    expect(result.relevanceScore).toBeGreaterThanOrEqual(4);
    expect(result.goalId).toBe('1');
    expect(result.tags.some(tag => 
      tag.toLowerCase().includes('sponsor') || 
      tag.toLowerCase().includes('brand') || 
      tag.toLowerCase().includes('deal')
    )).toBe(true);
    expect(result.status).toBe('pending');
    expect(result.explanation).toBeTruthy();
    expect(result.explanation.length).toBeGreaterThan(10);
  }, 10000);

  it('should classify a speaking engagement opportunity', async () => {
    const content = 'Would you be interested in being a keynote speaker at our annual tech conference? We can offer a $20k speaking fee.';
    
    const result = await perplexityAI.classifyOpportunity(content, mockGoals);
    
    expect(result.relevanceScore).toBeGreaterThanOrEqual(3);
    expect(result.goalId).toBe('2');
    expect(result.tags.some(tag => 
      tag.toLowerCase().includes('speak') || 
      tag.toLowerCase().includes('conference') || 
      tag.toLowerCase().includes('keynote')
    )).toBe(true);
    expect(result.status).toBe('pending');
    expect(result.explanation).toBeTruthy();
  }, 10000);

  it('should classify a low-relevance opportunity', async () => {
    const content = 'Check out these amazing sunglasses! Only $19.99!';
    
    const result = await perplexityAI.classifyOpportunity(content, mockGoals);
    
    expect(result.relevanceScore).toBeLessThanOrEqual(2);
    expect(result.goalId === undefined || result.goalId === null).toBe(true);
    expect(result.status).toBe('rejected');
    expect(result.explanation).toBeTruthy();
  }, 10000);

  it('should classify a charity collaboration opportunity', async () => {
    const content = 'I represent UNICEF and we\'d love to discuss a potential collaboration for our upcoming children\'s education campaign.';
    
    const result = await perplexityAI.classifyOpportunity(content, mockGoals);
    
    expect(result.relevanceScore).toBeGreaterThanOrEqual(3);
    expect(result.goalId).toBe('3');
    expect(result.tags.some(tag => 
      tag.toLowerCase().includes('charity') || 
      tag.toLowerCase().includes('unicef') || 
      tag.toLowerCase().includes('non-profit') || 
      tag.toLowerCase().includes('nonprofit') ||
      tag.toLowerCase().includes('collaboration')
    )).toBe(true);
    expect(result.status).toBe('pending');
    expect(result.explanation).toBeTruthy();
  }, 10000);

  it('should handle empty goals array', async () => {
    const content = 'Hi, I\'m from Nike. We\'d love to discuss a potential sponsorship.';
    
    const result = await perplexityAI.classifyOpportunity(content, []);
    
    expect(result.relevanceScore).toBeDefined();
    expect(result.goalId === undefined || result.goalId === null).toBe(true);
    expect(result.tags).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.explanation).toBeTruthy();
  }, 10000);

  it('should handle invalid API key', async () => {
    const invalidPerplexityAI = new PerplexityAI('invalid-key');
    const content = 'Test message';

    await expect(
      invalidPerplexityAI.classifyOpportunity(content, mockGoals)
    ).rejects.toThrow();
  }, 10000);

  it('should handle very long messages', async () => {
    const longContent = 'A'.repeat(5000);
    
    const result = await perplexityAI.classifyOpportunity(longContent, mockGoals);
    
    expect(result.relevanceScore).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.explanation).toBeTruthy();
  }, 15000);

  it('should handle messages with special characters', async () => {
    const content = '🎉 Hi! We\'d love to discuss a $100k sponsorship deal! 🤝 #opportunity @celebrity';
    
    const result = await perplexityAI.classifyOpportunity(content, mockGoals);
    
    expect(result.relevanceScore).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.explanation).toBeTruthy();
  }, 10000);
}); 