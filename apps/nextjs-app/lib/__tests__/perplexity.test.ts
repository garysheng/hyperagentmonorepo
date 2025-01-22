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
    },
    {
      id: '4',
      name: 'Find Supermodel Wife',
      description: 'Looking to connect with and potentially marry a successful supermodel'
    }
  ];

  it('should classify a highly relevant sponsorship opportunity', async () => {
    const content = 'Hi, I\'m from Nike. We\'d love to discuss a potential $500k sponsorship deal for our new product line.';
    
    const result = await perplexityAI.classifyOpportunity({
      content,
      goals: mockGoals,
      email: 'brand.manager@nike.com'
    });
    
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
    
    const result = await perplexityAI.classifyOpportunity({
      content,
      goals: mockGoals,
      email: 'conference@techconf.com'
    });
    
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
    
    const result = await perplexityAI.classifyOpportunity({
      content,
      goals: mockGoals
    });
    
    expect(result.relevanceScore).toBeLessThanOrEqual(2);
    expect(result.goalId === undefined || result.goalId === null).toBe(true);
    expect(result.status).toBe('rejected');
    expect(result.explanation).toBeTruthy();
  }, 10000);

  it('should classify a charity collaboration opportunity', async () => {
    const content = 'I represent UNICEF and we\'d love to discuss a potential collaboration for our upcoming children\'s education campaign.';
    
    const result = await perplexityAI.classifyOpportunity({
      content,
      goals: mockGoals,
      email: 'partnerships@unicef.org'
    });
    
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
    
    const result = await perplexityAI.classifyOpportunity({
      content,
      goals: []
    });
    
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
      invalidPerplexityAI.classifyOpportunity({
        content,
        goals: mockGoals
      })
    ).rejects.toThrow();
  }, 10000);

  it('should handle very long messages', async () => {
    const longContent = 'A'.repeat(5000);
    
    const result = await perplexityAI.classifyOpportunity({
      content: longContent,
      goals: mockGoals
    });
    
    expect(result.relevanceScore).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.explanation).toBeTruthy();
  }, 15000);

  it('should handle messages with special characters', async () => {
    const content = '🎉 Hi! We\'d love to discuss a $100k sponsorship deal! 🤝 #opportunity @celebrity';
    
    const result = await perplexityAI.classifyOpportunity({
      content,
      goals: mockGoals
    });
    
    expect(result.relevanceScore).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.explanation).toBeTruthy();
  }, 10000);

  it('should classify a message from a supermodel', async () => {
    const content = 'Hi, I\'m Gisele Bündchen. I saw your profile and would love to connect over dinner. I\'ve been featured in Vogue 100+ times and was the highest paid model for 15 years straight with Forbes.';
    
    const result = await perplexityAI.classifyOpportunity({
      content,
      goals: mockGoals,
      twitterUsername: 'gisele'
    });
    
    expect(result.relevanceScore).toBeGreaterThanOrEqual(4);
    expect(result.goalId).toBe('4');
    expect(result.tags.some(tag => 
      tag.toLowerCase().includes('model') || 
      tag.toLowerCase().includes('supermodel') || 
      tag.toLowerCase().includes('dating') ||
      tag.toLowerCase().includes('relationship')
    )).toBe(true);
    expect(result.status).toBe('pending');
    expect(result.explanation).toBeTruthy();
    expect(result.explanation.toLowerCase()).toContain('supermodel');
    expect(result.senderBio).toBeTruthy();
    expect(result.senderBio.toLowerCase()).toContain('vogue');
    expect(result.senderBio.toLowerCase()).toContain('forbes');
  }, 10000);
}); 