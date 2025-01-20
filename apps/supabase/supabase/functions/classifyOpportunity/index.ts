import { createClient } from '@supabase/supabase-js';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { Client as LangSmithClient } from 'langsmith';
import { fetchUserProfile } from './perplexityApi';
import { randomUUID } from 'crypto';

interface ClassificationResult {
  goal_index: number;
  relevance_score: number;
  tags: string[];
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize LangChain components
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0
});

// Initialize LangSmith client
const langsmith = new LangSmithClient({
  apiUrl: process.env.LANGSMITH_API_URL,
  apiKey: process.env.LANGSMITH_API_KEY
});

export async function classifyOpportunity(opportunityId: string): Promise<void> {
  const runId = randomUUID();
  
  try {
    // Create a new run trace
    await langsmith.createRun({
      id: runId,
      name: 'classifyOpportunity',
      inputs: { opportunityId },
      run_type: 'chain',
      start_time: Date.now()
    });

    try {
      // 1. Fetch opportunity data
      const { data: opp, error: oppError } = await supabase
        .from('opportunities')
        .select(`
          id,
          initial_content,
          sender_handle,
          celebrity_id
        `)
        .eq('id', opportunityId)
        .single();

      if (oppError || !opp) throw new Error('Opportunity not found');

      // 2. Fetch celebrity's goals
      const { data: celeb, error: celebError } = await supabase
        .from('celebrities')
        .select('goals')
        .eq('id', opp.celebrity_id)
        .single();

      if (celebError || !celeb) throw new Error('Celebrity not found');

      // 3. Research the sender using Perplexity
      const userProfile = await fetchUserProfile(opp.sender_handle.replace('@', ''));

      // 4. Set up LangChain prompt
      const prompt = new PromptTemplate({
        template: `
          You are an AI assistant that classifies inbound DMs to a celebrity.

          Celebrity's Goals:
          {goals}

          Sender Information:
          {senderProfile}

          DM Content:
          "{dmContent}"

          Instructions:
          1. Choose the most relevant goal index (0 if none match).
          2. Assign a relevance score (1-5, where 5 is highest).
          3. Generate up to 3 relevant tags.

          Return a JSON object with:
          {
            "goal_index": number,
            "relevance_score": number,
            "tags": string[]
          }
        `,
        inputVariables: ['goals', 'senderProfile', 'dmContent']
      });

      // 5. Create LangChain chain
      const chain = new LLMChain({
        llm: model,
        prompt
      });

      // 6. Execute chain
      const result = await chain.call({
        goals: JSON.stringify(celeb.goals, null, 2),
        senderProfile: userProfile.summary,
        dmContent: opp.initial_content
      });

      // 7. Parse classification result
      let classification: ClassificationResult;
      try {
        classification = JSON.parse(result.text);
      } catch (err) {
        classification = {
          goal_index: 0,
          relevance_score: 1,
          tags: []
        };
      }

      // 8. Update opportunity with classification
      const { error: updateError } = await supabase
        .from('opportunities')
        .update({
          tags: classification.tags,
          relevance_score: classification.relevance_score,
          goal_index: classification.goal_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', opportunityId);

      if (updateError) throw new Error(`Failed to update opportunity: ${updateError.message}`);

      // 9. Update LangSmith run with success
      await langsmith.updateRun(runId, {
        end_time: Date.now(),
        outputs: { classification }
      });

    } catch (error) {
      // Update LangSmith run with error
      await langsmith.updateRun(runId, {
        end_time: Date.now(),
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
} 