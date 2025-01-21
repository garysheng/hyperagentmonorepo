import { createClient } from '@supabase/supabase-js';
// @ts-ignore - Deno imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Declare Deno types
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface ClassificationResult {
  goal_index: number;
  relevance_score: number;
  tags: string[];
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function classifyOpportunity(opportunityId: string): Promise<void> {
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
      .select(`
        id,
        goals (
          id,
          name,
          description,
          priority
        )
      `)
      .eq('id', opp.celebrity_id)
      .single();

    if (celebError || !celeb) throw new Error('Celebrity not found');

    // 3. Call Perplexity API for classification
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-huge-128k-online',
        messages: [{
          role: 'system',
          content: 'You are an AI that classifies inbound DMs to a celebrity based on their goals. Return only valid JSON.'
        }, {
          role: 'user',
          content: `
            Classify this DM based on the celebrity's goals:

            Celebrity's Goals:
            ${celeb.goals.map((goal: any, index: number) => 
              `${index}. ${goal.name}: ${goal.description} (Priority: ${goal.priority})`
            ).join('\n')}

            DM Content:
            "${opp.initial_content}"

            Return a JSON object with:
            {
              "goal_index": number (index of most relevant goal, 0 if none match),
              "relevance_score": number (1-5, where 5 is highest relevance),
              "tags": string[] (up to 3 relevant tags)
            }
          `
        }],
        max_tokens: 500
      })
    });

    if (!perplexityResponse.ok) {
      throw new Error('Failed to classify opportunity');
    }

    const perplexityData = await perplexityResponse.json();
    const responseContent = perplexityData.choices[0].message.content;

    // Parse classification result
    let classification: ClassificationResult;
    try {
      // Extract JSON from response using regex
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      classification = JSON.parse(jsonMatch[0]);
    } catch (err) {
      // Fallback classification
      classification = {
        goal_index: 0,
        relevance_score: 1,
        tags: []
      };
    }

    // Update opportunity with classification
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

  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
}

// HTTP handler for edge function
serve(async (req: Request) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse request body
    const body = await req.json();
    const { opportunityId } = body;

    if (!opportunityId) {
      return new Response('Missing opportunityId', { status: 400 });
    }

    // Queue classification
    await classifyOpportunity(opportunityId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    console.error('Error:', err);
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 