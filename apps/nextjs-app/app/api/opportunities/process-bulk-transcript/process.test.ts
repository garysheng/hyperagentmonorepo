import { describe, it, expect } from 'vitest'
import { analyzeBulkTranscript } from './process'

describe('analyzeBulkTranscript', () => {
  const opportunities = [
    {
      id: 'opp1',
      initial_content: 'Interested in discussing AI collaboration',
      status: 'pending',
      sender_handle: 'ai_researcher'
    },
    {
      id: 'opp2',
      initial_content: 'Would love to discuss blockchain technology',
      status: 'pending',
      sender_handle: 'crypto_dev'
    },
    {
      id: 'opp3',
      initial_content: 'Potential partnership for IoT project',
      status: 'approved',
      sender_handle: 'iot_expert'
    }
  ]

  it('should identify multiple opportunities in a transcript', async () => {
    const input = {
      opportunities,
      transcript: `
        Host: Let's go through today's opportunities.
        
        First, about the AI collaboration proposal.
        Guest: Yes, I think we should move forward with that one.
        Host: Agreed, their expertise looks solid.
        
        Now, about the blockchain discussion.
        Guest: I'm not sure about that one, seems too promotional.
        Host: Yes, let's pass on that.
        
        That's all for today's review.
      `
    }

    const result = await analyzeBulkTranscript(input)

    expect(result.identifiedOpportunities).toHaveLength(2)
    expect(result.identifiedOpportunities.map(o => o.id)).toContain('opp1')
    expect(result.identifiedOpportunities.map(o => o.id)).toContain('opp2')
    
    const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
    expect(aiOpp?.confidence).toBeGreaterThan(0.7)
    expect(aiOpp?.relevantSection).toMatch(/AI collaboration[\s\S]*expertise looks solid/)

    const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
    expect(blockchainOpp?.confidence).toBeGreaterThan(0.5)
    expect(blockchainOpp?.relevantSection).toMatch(/blockchain discussion[\s\S]*seems too promotional/)
  }, 30000)

  it('should identify opportunities by sender handle', async () => {
    const input = {
      opportunities,
      transcript: `
        Host: Let's review the pending requests.
        
        The ai_researcher should be approved.
        Guest: Yes, their background is impressive.
        
        What about crypto_dev?
        Host: Not a good fit for us right now.
      `
    }

    const result = await analyzeBulkTranscript(input)

    expect(result.identifiedOpportunities).toHaveLength(2)
    expect(result.identifiedOpportunities.map(o => o.id)).toContain('opp1')
    expect(result.identifiedOpportunities.map(o => o.id)).toContain('opp2')
    
    const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
    expect(aiOpp?.confidence).toBeGreaterThan(0.7)
    expect(aiOpp?.relevantSection).toMatch(/ai_researcher[\s\S]*should be approved/)
  }, 30000)

  it('should handle transcripts with no matching opportunities', async () => {
    const input = {
      opportunities,
      transcript: `
        Host: Today we're discussing something completely different.
        Guest: Yes, let's talk about marketing strategies.
        Host: Great idea, marketing is key.
      `
    }

    const result = await analyzeBulkTranscript(input)

    expect(result.identifiedOpportunities).toHaveLength(0)
  }, 30000)

  it('should extract relevant sections accurately', async () => {
    const input = {
      opportunities,
      transcript: `
        Host: Welcome everyone.
        
        Let's discuss the IoT project first.
        Guest: The technical specs look good.
        Host: Yes, and they have a strong team.
        Guest: Should we proceed?
        Host: Yes, let's move forward.

        Other topic: Marketing budget review.
        Guest: We need to increase it.
        Host: Agreed, let's plan that.

        Finally, the AI collaboration.
        Guest: Their proposal is interesting.
        Host: But we need more details.
      `
    }

    const result = await analyzeBulkTranscript(input)

    const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
    expect(iotOpp?.relevantSection).toMatch(/IoT project[\s\S]*move forward/)
    expect(iotOpp?.relevantSection).not.toMatch(/Marketing budget/)

    const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
    expect(aiOpp?.relevantSection).toMatch(/AI collaboration[\s\S]*more details/)
    expect(aiOpp?.relevantSection).not.toMatch(/Marketing budget/)
  }, 30000)

  it('should provide accurate confidence scores', async () => {
    const input = {
      opportunities,
      transcript: `
        Host: Quick updates:
        
        The AI collaboration looks very promising,
        we've reviewed their background thoroughly
        and want to proceed immediately.
        
        Someone mentioned blockchain but we didn't
        really discuss it in detail.
        
        The IoT project was briefly mentioned
        but we'll cover it next time.
      `
    }

    const result = await analyzeBulkTranscript(input)

    const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
    const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
    const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')

    // High confidence for detailed discussion
    expect(aiOpp?.confidence).toBeGreaterThan(0.8)
    
    // Low confidence for briefly mentioned opportunities
    expect(blockchainOpp?.confidence).toBeLessThanOrEqual(0.5)
    expect(iotOpp?.confidence).toBeLessThanOrEqual(0.5)
  }, 30000)
}) 