import { describe, it, expect } from 'vitest'
import { processTranscript } from './process'

describe('processTranscript', () => {
  // Test 1: Approval scenario
  it('should process a transcript that leads to approval', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'I\'d like to collaborate on a podcast about AI technology',
      transcript: `
        Host: Thanks for joining today. I've reviewed your podcast proposal.
        Guest: Yes, I'm excited about the AI technology discussion.
        Host: Your experience in AI is exactly what we're looking for.
        Guest: Great! I can share insights from my recent projects.
        Host: Perfect. Let's move forward with this collaboration.
        Guest: Excellent! When should we schedule the recording?
        Host: Let's set that up next week. This looks very promising.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'approved',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/podcast|collaboration|AI|technology/i)
    expect(result.actionRecap).toMatch(/schedule|recording|next week/i)
  }, 30000) // Increased timeout for LLM call

  // Test 2: Rejection scenario
  it('should process a transcript that leads to rejection', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'Interested in discussing AI on your podcast',
      transcript: `
        Host: I've reviewed your background in AI.
        Guest: Yes, I'm looking to promote my new AI product.
        Host: We try to avoid promotional content.
        Guest: But it's revolutionary technology!
        Host: Sorry, we focus on educational content.
        Guest: I can pay for the feature.
        Host: That's not something we're interested in.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'rejected',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/promotional|product|not interested/i)
    expect(result.actionRecap).toMatch(/reject|decline|not suitable/i)
  }, 30000)

  // Test 3: Pending/Follow-up scenario
  it('should process a transcript that needs more follow-up', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'Interest in AI podcast collaboration',
      transcript: `
        Host: Let's discuss your AI expertise.
        Guest: I've been working in machine learning for 5 years.
        Host: Interesting. Could you send more details about your recent projects?
        Guest: Sure, I'll email those over.
        Host: Great, let's review those and reconnect.
        Guest: Perfect, I'll send them today.
        Host: Looking forward to continuing our discussion.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'pending',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/details|projects|expertise/i)
    expect(result.actionRecap).toMatch(/send|email|follow.?up/i)
  }, 30000)

  // Test 4: Status change from approved to rejected
  it('should handle status change from approved to rejected', async () => {
    const input = {
      currentStatus: 'approved',
      initialMessage: 'Confirmed for AI podcast next week',
      transcript: `
        Host: We need to discuss some concerns.
        Guest: What's the issue?
        Host: We found some inconsistencies in your background.
        Guest: I may have overstated some things.
        Host: This is a serious concern for us.
        Guest: I understand, but...
        Host: We'll need to cancel our plans.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'rejected',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/concerns|inconsistencies|cancel/i)
    expect(result.actionRecap).toMatch(/cancel|terminate|end/i)
  }, 30000)

  // Test 5: Complex discussion with multiple topics
  it('should handle complex discussions with multiple topics', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'Interested in AI collaboration',
      transcript: `
        Host: Let's cover several topics today.
        Guest: Sure, I'm ready.
        Host: First, your AI background is impressive.
        Guest: Thanks, I've worked on several key projects.
        Host: However, we need to discuss scheduling conflicts.
        Guest: I can be flexible with timing.
        Host: Also, our content guidelines are strict.
        Guest: I understand and will comply.
        Host: Let's also talk about the technical requirements.
        Guest: I have all the necessary equipment.
        Host: Great, but we still need to verify some references.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: expect.any(String),
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/background|scheduling|guidelines|technical/i)
    expect(result.actionRecap).toMatch(/verify|references|follow.?up/i)
  }, 30000)
}) 