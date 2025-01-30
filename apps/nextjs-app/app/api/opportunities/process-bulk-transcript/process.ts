import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Client } from 'langsmith'
import { BaseMessage } from '@langchain/core/messages'

interface ExtendedBaseMessage extends BaseMessage {
  llmOutput?: {
    tokenUsage?: {
      total_tokens?: number
      totalTokens?: number
    }
  }
  tokenUsage?: {
    total_tokens?: number
    totalTokens?: number
  }
}

// Default model configuration
const DEFAULT_MODEL_CONFIG = {
  modelName: "gpt-4o",
  temperature: 0
} as const

export interface BulkTranscriptAnalysisInput {
  transcript: string
  opportunities: Array<{
    id: string
    initial_content: string
    status: string
    sender_handle?: string
  }>
  modelConfig?: {
    modelName: string
    temperature?: number
    maxTokens?: number
    baseURL?: string
    apiKey?: string
  }
}

export interface OpportunityReference {
  id: string
  relevantSection: string
}

export interface BulkTranscriptAnalysisResult {
  identifiedOpportunities: OpportunityReference[]
  metadata: {
    modelName: string
    temperature: number
    maxTokens?: number
    processingTimeMs: number
  }
}

export async function analyzeBulkTranscript(input: BulkTranscriptAnalysisInput): Promise<BulkTranscriptAnalysisResult> {
  const startTime = Date.now()
  const modelConfig = {
    ...DEFAULT_MODEL_CONFIG,
    ...input.modelConfig
  }

  const client = new Client({
    apiUrl: process.env.LANGCHAIN_ENDPOINT,
    apiKey: process.env.LANGCHAIN_API_KEY
  })

  const model = new ChatOpenAI({
    modelName: modelConfig.modelName,
    temperature: modelConfig.temperature,
    maxTokens: modelConfig.maxTokens,
    configuration: modelConfig.baseURL ? {
      baseURL: modelConfig.baseURL,
      apiKey: modelConfig.apiKey || process.env.OPENAI_API_KEY
    } : undefined,
    callbacks: [
      {
        handleLLMEnd: async (output, runId) => {
          const now = Date.now()
          await client.createRun({
            id: runId,
            name: "analyze_bulk_transcript",
            run_type: "llm",
            inputs: {
              transcript: input.transcript,
              opportunities: input.opportunities,
              modelConfig
            },
            outputs: {
              result: (output.generations[0][0] as any).message?.additional_kwargs?.function_call?.arguments || "{}"
            },
            start_time: now - 1000,
            end_time: now,
            extra: {
              modelName: modelConfig.modelName,
              temperature: modelConfig.temperature,
              maxTokens: modelConfig.maxTokens
            }
          })
        }
      }
    ]
  }).bind({
    functions: [{
      name: "analyze_bulk_transcript",
      description: "Analyze a meeting transcript and identify which opportunities were discussed",
      parameters: {
        type: "object",
        properties: {
          identifiedOpportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "The ID of the opportunity that was discussed"
                },
                relevantSection: {
                  type: "string",
                  description: "The section of the transcript relevant to this opportunity"
                }
              },
              required: ["id", "relevantSection"]
            },
            description: "List of opportunities identified in the transcript"
          }
        },
        required: ["identifiedOpportunities"]
      }
    }],
    function_call: { name: "analyze_bulk_transcript" }
  })

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an AI assistant helping to analyze meeting transcripts about opportunities.
      Your task is to:
      1. Identify which opportunities from the provided list were discussed in the transcript
      2. Extract ONLY the EXACT meeting discussion parts (not the initial messages)

      Here are the opportunities to look for:
      {opportunities}
      
      CRITICAL RULES FOR RELEVANT SECTION:
      - The relevant section must contain ONLY word-for-word quotes from the transcript
      - NO paraphrasing, summarizing, or creating new text
      - Include the ENTIRE relevant discussion about an opportunity, not just a single line
      - Match opportunities by their ID, initial content, or sender handle
      - For enthusiastic discussions, include ALL related comments showing the enthusiasm
      - For indirect references, include the full context around the reference
      - Leave relevantSection EMPTY if you can't find an exact quote
      
      Examples:
      Transcript: "First, about the AI collaboration proposal. Yes, I think we should move forward with that one."
      ✓ Relevant section: "First, about the AI collaboration proposal. Yes, I think we should move forward with that one."
      ✗ Relevant section: "Team discussed AI collaboration"

      Transcript: "Let's review the ai_researcher proposal. Strong technical background. Approved for next steps."
      ✓ Relevant section: "Let's review the ai_researcher proposal. Strong technical background. Approved for next steps."
      ✗ Relevant section: "Team approved ai_researcher's proposal"

      Transcript: "The cloud migration looks perfect! Team loves it. This will transform everything!"
      ✓ Relevant section: "The cloud migration looks perfect! Team loves it. This will transform everything!"
      ✗ Relevant section: "Team approved cloud migration"

      Transcript: "Infrastructure modernization was mentioned... cloud-native approach seems promising."
      ✓ Relevant section: "Infrastructure modernization was mentioned... cloud-native approach seems promising."
      ✗ Relevant section: "Discussed cloud migration"

      Transcript: "Today we're discussing marketing strategies and team updates."
      ✓ Return empty array - no opportunities discussed
      ✗ Try to force matches for unrelated discussions

      CRITICAL RULES FOR NO MATCHES:
      - If the transcript discusses completely unrelated topics, return an empty array
      - Do not try to force matches when there are none
      - Only include opportunities that are actually discussed
      - Better to return no matches than to include weak/uncertain matches
      - A mere mention of a related word is not enough - there must be actual discussion

      CRITICAL RULES FOR INDIRECT REFERENCES:
      - Look for technical terms that clearly relate to the opportunity
      - Consider project names or initiative descriptions that match
      - Include contextual clues that confirm the connection
      - For infrastructure/technical discussions, match based on technology stack
      - Higher confidence if multiple team members reference the same topic

      Remember:
      - Include the COMPLETE relevant discussion, not just fragments
      - Match opportunities by ID, content keywords, or sender handle
      - When in doubt, include more context in the relevant section
      - Return empty array if no opportunities are discussed`],
    ["human", "{transcript}"]
  ])

  const formattedPrompt = await prompt.formatMessages({
    opportunities: input.opportunities.map(opp =>
      `ID: ${opp.id}
      Initial Message: ${opp.initial_content}
      Current Status: ${opp.status}
      ${opp.sender_handle ? 'Sender Handle: ' + opp.sender_handle : ''}`
    ).join('\n\n'),
    transcript: input.transcript
  })

  const response = await model.invoke(formattedPrompt) as ExtendedBaseMessage
  const result = response.additional_kwargs.function_call?.arguments
    ? JSON.parse(response.additional_kwargs.function_call.arguments)
    : { identifiedOpportunities: [] }

  return {
    ...result,
    metadata: {
      modelName: modelConfig.modelName,
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
      processingTimeMs: Date.now() - startTime
    }
  } as BulkTranscriptAnalysisResult
} 