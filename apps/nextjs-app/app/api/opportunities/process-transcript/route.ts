import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get request body
    const { opportunityId, transcript } = await request.json()
    if (!opportunityId || !transcript) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the opportunity to provide context
    const { data: opportunity } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single()

    if (!opportunity) {
      return new NextResponse('Opportunity not found', { status: 404 })
    }

    // Process transcript with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to process meeting transcripts about opportunities.
          Your task is to analyze the transcript and extract:
          1. The proposed status change (if any)
          2. A concise summary of the discussion
          3. A recap of actions/changes to be made

          The current opportunity status is: ${opportunity.status}
          The opportunity's initial message was: ${opportunity.initial_content}
          `
        },
        {
          role: "user",
          content: transcript
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "process_transcript",
            description: "Process the meeting transcript and extract key information",
            parameters: {
              type: "object",
              properties: {
                proposedStatus: {
                  type: "string",
                  enum: ["pending", "approved", "rejected"],
                  description: "The proposed new status for the opportunity based on the discussion"
                },
                summary: {
                  type: "string",
                  description: "A concise summary of the key points discussed in the meeting"
                },
                actionRecap: {
                  type: "string",
                  description: "A recap of the actions and changes that should be made based on the discussion"
                }
              },
              required: ["proposedStatus", "summary", "actionRecap"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "process_transcript" } }
    })

    const toolCall = completion.choices[0].message.tool_calls?.[0]
    const result = toolCall?.function ? JSON.parse(toolCall.function.arguments) : {}

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing transcript:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 