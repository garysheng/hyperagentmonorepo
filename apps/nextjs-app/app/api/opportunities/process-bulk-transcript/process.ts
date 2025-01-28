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
  confidence: number
}

export interface BulkTranscriptAnalysisResult {
  identifiedOpportunities: OpportunityReference[]
  metadata: {
    modelName: string
    temperature: number
    maxTokens?: number
    processingTimeMs: number
    totalTokens: number
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
          const tokenUsage = output.llmOutput?.tokenUsage || {
            totalTokens: output.llmOutput?.tokenUsage?.total_tokens || 0,
            promptTokens: output.llmOutput?.tokenUsage?.prompt_tokens || 0,
            completionTokens: output.llmOutput?.tokenUsage?.completion_tokens || 0
          }

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
              result: (output.generations[0][0] as any).message?.additional_kwargs?.function_call?.arguments || "{}",
              totalTokens: tokenUsage.totalTokens
            },
            start_time: now - 1000,
            end_time: now,
            extra: {
              modelName: modelConfig.modelName,
              temperature: modelConfig.temperature,
              maxTokens: modelConfig.maxTokens,
              totalTokens: tokenUsage.totalTokens,
              promptTokens: tokenUsage.promptTokens,
              completionTokens: tokenUsage.completionTokens
            }
          })

            // Store token usage for the result metadata
            ; (output as any).tokenUsage = tokenUsage
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
                },
                confidence: {
                  type: "number",
                  description: "Confidence score (0-1) that this opportunity was actually discussed"
                }
              },
              required: ["id", "relevantSection", "confidence"]
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
      3. Provide a confidence score for each match

      Here are the opportunities to look for:
      {opportunities}
      
      CRITICAL RULES FOR RELEVANT SECTION:
      - The relevant section must contain ONLY word-for-word quotes from the transcript
      - NO paraphrasing, summarizing, or creating new text
      - If the transcript is "approve user@email.com", that's the EXACT text to use
      - If the transcript is "Team Lead: let's approve X", that's the EXACT text to use
      - Leave relevantSection EMPTY if you can't find an exact quote
      
      Examples:
      Transcript: "approve Morris@email.com"
      ✓ Relevant section: "approve Morris@email.com"
      ✗ Relevant section: "Team discussed approving Morris"

      Transcript: "Team Lead: Should we approve Morris? Manager: Yes"
      ✓ Relevant section: "Team Lead: Should we approve Morris? Manager: Yes"
      ✗ Relevant section: "The team agreed to approve Morris"
      
      Guidelines for confidence scores:
      - Score > 0.8: Found exact quote with clear decision
      - Score 0.6-0.8: Found exact quote but decision unclear
      - Score 0.3-0.5: Found partial or ambiguous quote
      - Score < 0.3: Quote might be about something else

      Remember:
      - ONLY use word-for-word quotes from the transcript
      - NO fabrication or inference
      - NO summarizing or paraphrasing
      - Empty relevantSection if no exact quote found
      - When in doubt, leave relevantSection empty`],
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

  // Get token usage directly from the response
  const totalTokens = response.llmOutput?.tokenUsage?.total_tokens ||
    response.llmOutput?.tokenUsage?.totalTokens ||
    response.tokenUsage?.total_tokens ||
    response.tokenUsage?.totalTokens || 0

  return {
    ...result,
    metadata: {
      modelName: modelConfig.modelName,
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
      processingTimeMs: Date.now() - startTime,
      totalTokens
    }
  } as BulkTranscriptAnalysisResult
} 