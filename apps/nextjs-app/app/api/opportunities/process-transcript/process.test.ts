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

  // Test 6: Internal team meeting discussing multiple opportunities
  it('should process a long team meeting transcript with multiple topics', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'Looking to discuss AI research collaboration',
      transcript: `
        Team Lead: Alright team, let's review this week's opportunities. First up is the AI researcher from Stanford.
        PM: I looked into their background. Very solid publication record in NLP and they've led several major projects.
        Engineer: I checked their GitHub - lots of high-quality open source contributions.
        Design Lead: The presentation they shared was well thought out too.
        Team Lead: Agreed. Any concerns?
        PM: Timeline might be tight with our current sprint schedule.
        Engineer: We can adjust the sprint planning to accommodate.
        Team Lead: Good point. Let's approve this one and fast-track it.
        HR: I'll prepare the paperwork right away.
        Team Lead: Perfect. Next opportunity...
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'approved',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/AI researcher|Stanford|background|publication|GitHub/i)
    expect(result.actionRecap).toMatch(/approve|fast.?track|prepare paperwork/i)
  }, 30000)

  // Test 7: Internal discussion about a problematic opportunity
  it('should process a transcript about a problematic opportunity', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'Interested in partnership opportunity',
      transcript: `
        Team Lead: Next up is the partnership proposal from that startup.
        Legal: I have some serious concerns here.
        PM: What's the issue?
        Legal: Their terms are very one-sided, and there are some red flags in their compliance history.
        Security: I also found some concerning practices in their data handling.
        Team Lead: That's not good. What else?
        PM: They've been pushing really aggressively for a quick decision.
        Engineer: And their technical documentation is quite vague.
        Team Lead: Sounds like we need to reject this one.
        Legal: I strongly recommend that.
        Team Lead: Agreed. Let's document all these issues clearly.
        PM: I'll draft the rejection notice with our concerns.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'rejected',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/concerns|compliance|red flags|data handling/i)
    expect(result.actionRecap).toMatch(/reject|document issues|draft rejection/i)
  }, 30000)

  // Test 8: Team meeting with mixed feedback requiring follow-up
  it('should handle a transcript with mixed feedback requiring more information', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'Proposal for AI ethics collaboration',
      transcript: `
        Team Lead: Let's discuss the AI ethics proposal.
        Ethics Officer: Their framework is interesting and aligns with our values.
        Research Lead: The methodology seems solid, but I have some questions.
        PM: Like what?
        Research Lead: We need more details about their testing procedures.
        Engineer: And clarification on how they handle edge cases.
        Ethics Officer: Their previous work is promising though.
        Team Lead: Sounds like we need more information before deciding.
        PM: Should I schedule a follow-up meeting?
        Team Lead: Yes, let's get those questions answered first.
        Research Lead: I'll compile a detailed list of what we need.
        Team Lead: Good. Keep this pending until we have those answers.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'pending',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/AI ethics|framework|methodology|questions/i)
    expect(result.actionRecap).toMatch(/follow.?up|questions|pending|more information/i)
  }, 30000)

  // Test 9: Large team meeting with multiple stakeholders
  it('should process a complex team meeting with multiple stakeholders', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'Enterprise partnership proposal',
      transcript: `
        Team Lead: Moving on to the enterprise partnership proposal.
        Sales: This could be our biggest deal this quarter.
        Finance: The numbers look good, 30% above our usual rate.
        Legal: I've reviewed the contract - standard terms, no red flags.
        Security: They passed our initial security assessment.
        Engineering: Technical requirements are within our capabilities.
        Product: Aligns well with our roadmap too.
        HR: We have the team capacity to support this.
        Marketing: Great potential for co-marketing opportunities.
        Customer Success: Support requirements are manageable.
        Team Lead: Sounds promising. Any concerns?
        PM: Timeline is aggressive but doable.
        Engineering: We'll need to adjust some sprint priorities.
        Team Lead: Can we handle that?
        PM: Yes, I've already drafted a plan.
        Team Lead: Excellent. Anyone opposed to moving forward?
        [No responses]
        Team Lead: Great, let's approve this one.
        PM: I'll start the onboarding process.
        Legal: I'll prepare the final contract.
        Sales: I'll coordinate with their team.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'approved',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/enterprise|partnership|multiple departments|positive feedback/i)
    expect(result.actionRecap).toMatch(/approve|onboarding|contract|coordinate/i)
  }, 30000)

  // Test 10: Quick team sync with immediate rejection
  it('should handle a quick team sync with clear rejection reasons', async () => {
    const input = {
      currentStatus: 'pending',
      initialMessage: 'Quick partnership proposal',
      transcript: `
        Team Lead: Quick sync about the incoming partnership proposal.
        Security: Stop right there - they failed our security audit.
        Legal: And they're involved in ongoing litigation.
        Team Lead: That's all I need to hear. Reject?
        All: Agreed.
        Team Lead: Done. Next item.
      `
    }

    const result = await processTranscript(input)

    expect(result).toMatchObject({
      proposedStatus: 'rejected',
      summary: expect.any(String),
      actionRecap: expect.any(String)
    })
    expect(result.summary).toMatch(/security audit|litigation|quick rejection/i)
    expect(result.actionRecap).toMatch(/reject|security concerns|legal issues/i)
  }, 30000)
}) 