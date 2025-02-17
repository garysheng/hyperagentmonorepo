import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Opportunity, Goal } from '@/types';
import { PerplexityAI } from '@/lib/perplexity';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize Perplexity client
const perplexity = new PerplexityAI(process.env.PERPLEXITY_API_KEY!);

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET() {
    try {
        // Fetch unclassified opportunities (relevance_score = -1)
        const { data: opportunities, error } = await supabase
            .from('opportunities')
            .select('*')
            .eq('relevance_score', -1)
            .limit(10); // Process 10 at a time to avoid timeouts

        if (error) throw error;
        if (!opportunities || opportunities.length === 0) {
            return NextResponse.json({ message: 'No unclassified opportunities found' });
        }

        // Group opportunities by celebrity_id for efficient goal fetching
        const celebrityIds = [...new Set(opportunities.map(opp => opp.celebrity_id))];

        // Fetch goals for all relevant celebrities
        const { data: goals, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .in('celebrity_id', celebrityIds)
            .order('priority', { ascending: false });

        if (goalsError) throw goalsError;

        // Create a map of celebrity_id to their goals
        const goalsByCelebrity = goals?.reduce((acc, goal) => {
            if (!acc[goal.celebrity_id]) {
                acc[goal.celebrity_id] = [];
            }
            acc[goal.celebrity_id].push(goal);
            return acc;
        }, {} as Record<string, Goal[]>) ?? {};

        // Process each opportunity
        const results = await Promise.all(
            opportunities.map(async (opp: Opportunity) => {
                try {
                    // Get goals for this celebrity
                    const celebrityGoals = goalsByCelebrity[opp.celebrity_id] || [];

                    // Get the classification from Perplexity
                    const classification = await perplexity.classifyOpportunity({
                        content: opp.initial_content,
                        goals: celebrityGoals,
                        email: opp.source === 'WIDGET' ? opp.sender_handle : undefined,
                        twitterUsername: opp.source === 'TWITTER_DM' ? opp.sender_handle : undefined
                    });

                    // Find the matched goal to get its default assignee
                    const matchedGoal = classification.goalId ? celebrityGoals.find((g: Goal) => g.id === classification.goalId) : null;
                    
                    // Update the opportunity with the classification results
                    const { error: updateError } = await supabase
                        .from('opportunities')
                        .update({
                            relevance_score: classification.relevanceScore,
                            tags: classification.tags,
                            status: classification.status,
                            needs_discussion: classification.needsDiscussion,
                            goal_id: classification.goalId,
                            sender_bio: classification.senderBio,
                            classification_explanation: classification.explanation,
                            classified_at: new Date().toISOString(),
                            assigned_to: matchedGoal?.default_user_id || null
                        })
                        .eq('id', opp.id);

                    if (updateError) throw updateError;

                    return {
                        id: opp.id,
                        success: true,
                        classification
                    };
                } catch (error) {
                    console.error(`Error classifying opportunity ${opp.id}:`, error);
                    return {
                        id: opp.id,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            })
        );

        return NextResponse.json({
            message: `Processed ${opportunities.length} opportunities`,
            results
        });
    } catch (error) {
        console.error('Error in classification endpoint:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 