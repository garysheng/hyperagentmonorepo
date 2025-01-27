import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Client } from 'langsmith'

export interface BulkTranscriptAnalysisInput {
  transcript: string
  opportunities: Array<{
    id: string
    initial_content: string
    status: string
  }>
}

export interface OpportunityReference {
  id: string
  relevantSection: string
  confidence: number
}

export interface BulkTranscriptAnalysisResult {
  identifiedOpportunities: OpportunityReference[]
}

export async function analyzeBulkTranscript(input: BulkTranscriptAnalysisInput): Promise<BulkTranscriptAnalysisResult> {
  const client = new Client({
    apiUrl: process.env.LANGCHAIN_ENDPOINT,
    apiKey: process.env.LANGCHAIN_API_KEY
  })

  const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0,
    callbacks: [
      {
        handleLLMEnd: async (output, runId) => {
          const now = Date.now()
          await client.createRun({
            id: runId,
            name: "analyze_bulk_transcript",
            run_type: "llm",
            inputs: { prompt: output.generations[0][0].text },
            outputs: { completion: output.generations[0][0].text },
            start_time: now - 1000,
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
      2. Extract the relevant section for each opportunity
      3. Provide a confidence score for each match

      Here are the opportunities to look for:
      {opportunities}
      
      Remember:
      - Only include opportunities that were actually discussed
      - Extract the minimal relevant section for each opportunity
      - Provide accurate confidence scores based on clarity of discussion`],
    ["human", "{transcript}"]
  ])

  const formattedPrompt = await prompt.formatMessages({
    opportunities: input.opportunities.map(opp => 
      `ID: ${opp.id}\nInitial Message: ${opp.initial_content}\nCurrent Status: ${opp.status}`
    ).join('\n\n'),
    transcript: input.transcript
  })
  
  const response = await model.invoke(formattedPrompt)
  const result = response.additional_kwargs.function_call?.arguments
    ? JSON.parse(response.additional_kwargs.function_call.arguments)
    : { identifiedOpportunities: [] }

  return result as BulkTranscriptAnalysisResult
} 