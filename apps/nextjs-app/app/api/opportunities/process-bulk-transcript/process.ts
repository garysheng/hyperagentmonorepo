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
      
      CRITICAL RULES FOR EMAIL MATCHING:
      - EXACT STRING MATCH REQUIRED: Email addresses must match character-for-character
        * "john.smith@email.com" ONLY matches "john.smith@email.com"
        * "john.smith.work@email.com" is NOT a match for "john.smith@email.com"
        * "john.smith@email.com" is NOT a match for "john.smith.different@email.com"
      
      - STRICT VALIDATION BEFORE MATCHING:
        1. Extract the exact email from the transcript
        2. Compare it character-by-character with sender_handle
        3. Only match if they are identical (ignoring case)
        4. Reject any partial or similar matches
      
      - SIMILAR EMAIL HANDLING:
        * Each opportunity has its own unique email address
        * Similar emails are different opportunities
        * Never match an email to a similar but different email
        * Example: If transcript mentions "john.smith.different@email.com":
          - ONLY match opportunity with exact "john.smith.different@email.com"
          - Do NOT match opportunity with "john.smith@email.com"
          - These are separate opportunities with separate discussions
      
      - EXAMPLES OF INVALID MATCHES:
        * "john.smith@email.com" ≠ "john.smith.work@email.com"
        * "john.smith@email.com" ≠ "john.smith.different@email.com"
        * "john.smith@email.com" ≠ "john.smith"
        * "john.smith@email.com" ≠ "@email.com"
        * "john.smith@email.com" ≠ "smith@email.com"
      
      - CASE INSENSITIVE MATCHING:
        * "John.Smith@Email.com" = "john.smith@email.com"
        * "JOHN.SMITH@EMAIL.COM" = "john.smith@email.com"
      
      - CONTENT MATCHING RULES:
        * If no exact email match, rely on content discussion
        * Technical details and project specifics take precedence
        * Match based on unique project characteristics
        * Consider full context of discussion

      - CRITICAL: CONTENT MATCHING PRIORITY
        * When email is ambiguous or generic (e.g., "someone at email.com"):
          1. IGNORE the ambiguous email completely
          2. Focus ONLY on the technical/project content
          3. Match based on specific details in the discussion
          4. Use unique keywords and project characteristics
        * Example:
          Transcript: "We have an AI proposal. It's from someone at email.com"
          - IGNORE "someone at email.com"
          - Focus on "AI proposal" and related technical details
          - Match with opportunity that best fits the technical discussion
        * Example:
          Transcript: "Got a cloud migration proposal from a gmail address"
          - IGNORE the email reference
          - Focus on "cloud migration" specifics
          - Match based on project type and technical details

      CRITICAL RULES FOR SOCIAL MEDIA HANDLE MATCHING:
      - If a sender_handle starts with @ or contains common social patterns:
        * Match the exact handle (e.g., "@techdev")
        * Match without @ symbol (e.g., "techdev")
        * Match name parts if handle contains real name
        * Match common username variations
      - Examples:
        * For "@john_doe_dev":
          - Match "@john_doe_dev" (exact)
          - Match "john_doe_dev" (without @)
          - Match "John" or "John Doe" (name parts)
        * For "@techwhiz2023":
          - Match "@techwhiz2023" or "techwhiz2023"
          - Match "techwhiz" (base username)
      - Consider platform-specific formats:
        * Twitter/X: @handle
        * GitHub: username or @username
        * Discord: username#1234 or just username
      - Include full context when matching social handles
      
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
      - For email-based opportunities, match on exact email only
      - For social handles, match on username variations and real names

      Remember:
      - Include the COMPLETE relevant discussion, not just fragments
      - Match opportunities by ID, content keywords, or sender handle
      - When in doubt, include more context in the relevant section
      - Return empty array if no opportunities are discussed
      - For email handles, require exact matches (case-insensitive)
      - For social handles, match both with and without @ symbol`],
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