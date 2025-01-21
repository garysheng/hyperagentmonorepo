import { createClient } from '@supabase/supabase-js'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Opportunity Classification', () => {
  // Test data
  const testCelebrity = {
    id: uuidv4(), // Generate a UUID for the test celebrity
    celebrity_name: 'Test Celebrity',
    twitter_username: 'test_celeb',
    twitter_password: 'test_password_123'
  }

  const testOpportunities = [
    {
      initial_content: 'I want to collaborate on a charity event for children\'s education',
      expected_score_range: [3, 5], // High relevance
      expected_tags: ['charity', 'education']
    },
    {
      initial_content: 'hey sup just wanted to say hi',
      expected_score_range: [0, 2], // Low relevance
      expected_tags: ['greeting']
    },
    {
      initial_content: 'Let\'s create a new podcast series about technology',
      expected_score_range: [2, 4], // Medium relevance
      expected_tags: ['podcast', 'technology']
    }
  ]

  // Setup: Create test celebrity
  beforeAll(async () => {
    const { error } = await supabase
      .from('celebrities')
      .insert(testCelebrity)

    if (error) throw error
  })

  // Cleanup: Delete test data
  afterAll(async () => {
    await supabase.from('celebrities').delete().eq('id', testCelebrity.id)
  })

  // Test trigger creation
  it('should have classification trigger installed', async () => {
    const { data, error } = await supabase.rpc('has_classification_trigger')
    if (error) throw error
    expect(data).toBe(true)
  })

  // Test opportunity classification
  it.each(testOpportunities)('should classify opportunity correctly: $initial_content', async ({ initial_content, expected_score_range, expected_tags }) => {
    // Create opportunity
    const { data: opp, error: createError } = await supabase
      .from('opportunities')
      .insert({
        celebrity_id: testCelebrity.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_handle: 'test@example.com',
        initial_content,
        relevance_score: -1,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) throw createError
    expect(opp.relevance_score).toBe(-1)

    // Wait for classification (up to 10 seconds)
    let classifiedOpp
    for (let i = 0; i < 10; i++) {
      const { data, error } = await supabase
        .from('opportunities')
        .select()
        .eq('id', opp.id)
        .single()

      if (error) throw error
      if (data.relevance_score !== -1) {
        classifiedOpp = data
        break
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Verify classification
    expect(classifiedOpp).toBeDefined()
    expect(classifiedOpp.relevance_score).toBeGreaterThanOrEqual(expected_score_range[0])
    expect(classifiedOpp.relevance_score).toBeLessThanOrEqual(expected_score_range[1])
    expect(classifiedOpp.tags).toEqual(expect.arrayContaining(expected_tags))
  })

  // Test manual classification trigger
  it('should allow manual classification trigger', async () => {
    // Create opportunity without triggering classification
    const { data: opp, error: createError } = await supabase
      .from('opportunities')
      .insert({
        celebrity_id: testCelebrity.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_handle: 'test@example.com',
        initial_content: 'Test manual classification',
        relevance_score: -1,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) throw createError

    // Manually trigger classification
    const { error: classifyError } = await supabase
      .rpc('trigger_classification', { opportunity_id: opp.id })

    expect(classifyError).toBeNull()

    // Wait for classification (up to 10 seconds)
    let classifiedOpp
    for (let i = 0; i < 10; i++) {
      const { data, error } = await supabase
        .from('opportunities')
        .select()
        .eq('id', opp.id)
        .single()

      if (error) throw error
      if (data.relevance_score !== -1) {
        classifiedOpp = data
        break
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Verify classification
    expect(classifiedOpp).toBeDefined()
    expect(classifiedOpp.relevance_score).toBeGreaterThanOrEqual(0)
    expect(classifiedOpp.relevance_score).toBeLessThanOrEqual(5)
  })
}) 