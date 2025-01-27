import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Client } from 'langsmith'

export interface TranscriptProcessingInput {
  currentStatus: string
  initialMessage: string
  transcript: string
}

export interface TranscriptProcessingResult {
  proposedStatus: 'pending' | 'approved' | 'rejected'
  summary: string
  actionRecap: string
}

export async function processTranscript(input: TranscriptProcessingInput): Promise<TranscriptProcessingResult> {
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
            name: "process_transcript",
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

  const formattedPrompt = await prompt.formatMessages({
    status: input.currentStatus,
    message: input.initialMessage,
    transcript: input.transcript
  })
  
  const response = await model.invoke(formattedPrompt)
  const result = response.additional_kwargs.function_call?.arguments
    ? JSON.parse(response.additional_kwargs.function_call.arguments)
    : {}

  return result as TranscriptProcessingResult
} 