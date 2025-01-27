import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Client } from 'langsmith'

// Initialize LangSmith client
const client = new Client({
  apiUrl: process.env.LANGCHAIN_ENDPOINT,
  apiKey: process.env.LANGCHAIN_API_KEY
})

const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
  callbacks: [
    {
      handleLLMEnd: async (output, runId) => {
        const now = Date.now()
        await client.createRun({
          id: runId,
          name: "process_transcript",
          run_type: "llm",
          inputs: { prompt: output.generations[0][0].text },
          outputs: { completion: output.generations[0][0].text },
          start_time: now - 1000, // 1 second ago
          end_time: now,
          extra: {
            tokens: output.llmOutput?.tokenUsage?.totalTokens || 0
          }
        })
      }
    }
  ]
}).bind({
  functions: [{
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
  }],
  function_call: { name: "process_transcript" }
})

const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are an AI assistant helping to process meeting transcripts about opportunities.
    Your task is to analyze the transcript and extract:
    1. The proposed status change (if any)
    2. A concise summary of the discussion
    3. A recap of actions/changes to be made

    The current opportunity status is: {status}
    The opportunity's initial message was: {message}`],
  ["human", "{transcript}"]
])

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

    // Process transcript with Langchain
    const formattedPrompt = await prompt.formatMessages({
      status: opportunity.status,
      message: opportunity.initial_content,
      transcript
    })
    
    const response = await model.invoke(formattedPrompt)
    const result = response.additional_kwargs.function_call?.arguments
      ? JSON.parse(response.additional_kwargs.function_call.arguments)
      : {}

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing transcript:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 