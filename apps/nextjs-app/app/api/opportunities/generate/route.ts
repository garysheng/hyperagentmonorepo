import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { faker } from '@faker-js/faker'
import { createWidgetOpportunity } from '@/lib/widget/opportunities'
import { createTwitterDMOpportunity } from '@/lib/twitter/opportunities'
import OpenAI from 'openai'

const OPPORTUNITY_SOURCES = ['WIDGET', 'TWITTER_DM'] as const

interface Goal {
  id: string
  name: string
  description: string
  priority: number
}

async function generateOpportunityWithLLM(celebrityName: string, goals: Goal[], source: typeof OPPORTUNITY_SOURCES[number], shouldBeRelevant: boolean) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Randomly select one goal if we're generating a relevant opportunity
    const selectedGoal = shouldBeRelevant ? goals[Math.floor(Math.random() * goals.length)] : null
    const goalContext = selectedGoal ? `${selectedGoal.name}: ${selectedGoal.description} (Priority: ${selectedGoal.priority})` : ''

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `You are an AI that generates realistic inbound business opportunities for celebrities.
          Generate a ${source === 'WIDGET' ? 'website contact form' : 'Twitter DM'} message for ${celebrityName}.
          
          ${shouldBeRelevant ? `The celebrity's current goal is:
          ${goalContext}` : ''}

          The message should be:
          - 1-3 sentences long
          - Sound like a real person reaching out
          - Include specific details about a business opportunity
          - Be professional but conversational
          - ${source === 'TWITTER_DM' ? 'More casual and suited for Twitter' : 'More formal and suited for a contact form'}
          ${shouldBeRelevant ? '- Align specifically with the provided goal' : '- Be a generic or random business opportunity'}
          
          Return only the message text, nothing else.`
      }, {
        role: 'user',
        content: `Generate a realistic ${source === 'WIDGET' ? 'contact form' : 'Twitter DM'} business opportunity message for ${celebrityName}${shouldBeRelevant ? ' that aligns with their goal' : ''}.`
      }],
      temperature: shouldBeRelevant ? 0.7 : 0.9,
      max_tokens: 150
    })

    return response.choices[0].message.content?.trim() || 'Hi, I have an interesting business opportunity I\'d like to discuss with you.'
  } catch (error) {
    console.error('Error generating message with OpenAI:', error)
    // Fallback to a default message if OpenAI fails
    return 'Hi, I have an interesting business opportunity I\'d like to discuss with you.'
  }
}

async function generateRandomOpportunity(supabase: any, celebrityId: string, celebrityName: string, goals: Goal[]) {
  const source = OPPORTUNITY_SOURCES[Math.floor(Math.random() * OPPORTUNITY_SOURCES.length)]
  const shouldBeRelevant = Math.random() < 0.3 // 30% chance of being goal-relevant
  const message = await generateOpportunityWithLLM(celebrityName, goals, source, shouldBeRelevant)

  if (source === 'WIDGET') {
    return createWidgetOpportunity({
      supabase,
      celebrityId,
      message,
      email: faker.internet.email()
    })
  } else {
    return createTwitterDMOpportunity({
      supabase,
      celebrity_id: celebrityId,
      dm_conversation_id: faker.string.uuid(),
      sender_username: faker.internet.username(),
      message_text: message,
      sender_id: faker.string.uuid(),
      event_id: faker.string.uuid()
    })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { celebrityId, count = 5 } = body

    if (!celebrityId) {
      return NextResponse.json(
        { error: 'Celebrity ID is required' },
        { status: 400 }
      )
    }

    if (typeof count !== 'number' || count < 1 || count > 25) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 25' },
        { status: 400 }
      )
    }

    // Get celebrity info and goals to personalize messages
    const { data: celebrity } = await supabase
      .from('celebrities')
      .select(`
        celebrity_name,
        goals (
          id,
          name,
          description,
          priority
        )
      `)
      .eq('id', celebrityId)
      .single()

    if (!celebrity) {
      return NextResponse.json(
        { error: 'Celebrity not found' },
        { status: 404 }
      )
    }

    if (!celebrity.goals?.length) {
      return NextResponse.json(
        { error: 'Celebrity has no goals defined' },
        { status: 400 }
      )
    }

    const promises = Array(count)
      .fill(null)
      .map(() => generateRandomOpportunity(supabase, celebrityId, celebrity.celebrity_name, celebrity.goals))

    await Promise.all(promises)

    return NextResponse.json({ 
      success: true,
      message: `Created ${count} test opportunities`
    })

  } catch (error) {
    console.error('Error generating opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to generate opportunities' },
      { status: 500 }
    )
  }
} 