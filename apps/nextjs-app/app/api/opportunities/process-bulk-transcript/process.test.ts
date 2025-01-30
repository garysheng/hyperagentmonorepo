import { describe, it, expect } from 'vitest'
import { analyzeBulkTranscript } from './process'
import OpenAI from 'openai'

// Change this to test different models
const MODEL_TO_TEST = {
    modelName: "gpt-4o",
    temperature: 0
} as const

// Available model configurations for reference
const AVAILABLE_MODELS = {
    GPT4O_MINI: {
        modelName: "gpt-4o-mini",
        temperature: 0,
    },
    GPT4O: {
        modelName: "gpt-4o",
        temperature: 0,
    },
    // DEEPSEEK: {
    //     modelName: "deepseek-chat",
    //     temperature: 0,
    //     baseURL: "https://api.deepseek.com",
    //     apiKey: process.env.DEEPSEEK_API_KEY
    // }
} as const

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// Helper function to evaluate results using GPT-4O
async function evaluateResults(transcript: string, result: any, expectations: {
    expectedOpportunityCount?: number,
    expectedOpportunityIds?: string[],
    relevantSectionRequirements?: string[]
}) {
    const prompt = `You are a test evaluator. Given a transcript and the analysis results, evaluate if they meet the requirements.

Transcript:
${transcript}

Analysis Results:
${JSON.stringify(result, null, 2)}

Requirements to check:
${JSON.stringify(expectations, null, 2)}

CRITICAL EVALUATION RULES:
1. For transcripts with no opportunities (expectedOpportunityCount = 0):
   - The identifiedOpportunities array MUST be empty
   - This is considered valid and should pass
   - No relevant sections should be present
   - The transcript should not contain any meaningful discussion of the opportunities

2. For transcripts with opportunities:
   - The number of opportunities must match expectedOpportunityCount
   - Relevant sections must be exact quotes from the transcript
   - All expectedOpportunityIds must be present (if specified)
   - Must include the entire discussion thread for each opportunity

3. For enthusiastic discussions:
   - Must include all team member comments showing consensus
   - Technical details and positive feedback should be captured
   - The entire discussion thread should be included

4. For indirect references:
   - Look for technical terms that map to opportunities
   - Consider project names and initiative descriptions
   - Multiple team members referencing same topic increases validity
   - Infrastructure/technical discussions can map to related opportunities

Remember:
- Relevant sections must include complete discussion threads
- Technical terms and project descriptions can indicate opportunity matches
- Team consensus and multiple references strengthen the match
- Return empty array if no opportunities are discussed
- Only include opportunities that are actually discussed

Evaluate if the results meet ALL of these criteria and respond in the following JSON format:
{
  "passed": boolean,
  "reasons": string[],
  "relevantSectionsValid": boolean,
  "opportunityCountValid": boolean,
  "opportunityIdsValid": boolean
}`

    const evaluation = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are a strict test evaluator that validates transcript analysis results.' },
            { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
    })

    const content = evaluation.choices[0].message.content
    if (!content) {
        throw new Error('No content received from OpenAI')
    }

    const response = JSON.parse(content)
    return response
}

describe('analyzeBulkTranscript', () => {
    const opportunities = [
        {
            id: 'cold1',
            initial_content: 'Senior ML Engineer with 8 years experience interested in AI team',
            status: 'pending',
            sender_handle: 'ml.sarah.chen@gmail.com'
        },
        {
            id: 'cold2',
            initial_content: 'Startup founder looking to discuss potential acquisition',
            status: 'pending',
            sender_handle: '@startup_ceo'
        },
        {
            id: 'cold3',
            initial_content: 'Enterprise sales partnership opportunity from Microsoft',
            status: 'pending',
            sender_handle: 'john.smith@microsoft.com'
        },
        {
            id: 'cold4',
            initial_content: 'Senior React Native dev interested in mobile team lead role',
            status: 'pending',
            sender_handle: 'mobile_ninja#1234'
        },
        {
            id: 'cold5',
            initial_content: 'VC interested in leading Series B round',
            status: 'pending',
            sender_handle: '@vc_partner'
        },
        {
            id: 'cold6',
            initial_content: 'DevOps architect looking to join infrastructure team',
            status: 'pending',
            sender_handle: 'james.wilson@devops.io'
        },
        {
            id: 'cold7',
            initial_content: 'Potential customer interested in enterprise plan',
            status: 'pending',
            sender_handle: 'director_of_eng'
        },
        {
            id: 'cold8',
            initial_content: 'Tech blogger interested in covering our AI features',
            status: 'pending',
            sender_handle: '@tech_influencer'
        },
        {
            id: 'cold9',
            initial_content: 'Security researcher found potential vulnerability',
            status: 'pending',
            sender_handle: 'security_white_hat'
        }
    ]

    it('should identify high-priority cold outreach', async () => {
        const input = {
            opportunities,
            transcript: `
                CEO: Let's review today's inbound opportunities.
                
                First, we got a message from Microsoft about enterprise sales.
                Sales: Yes, john.smith@microsoft.com reached out. They're interested in a major partnership.
                CEO: This could be significant. Let's prioritize this.
                
                Also, @startup_ceo messaged about acquisition discussions.
                CFO: Their metrics look interesting, revenue growing 300% YoY.
                CEO: Good potential, let's schedule a call.
            `,
            modelConfig: MODEL_TO_TEST
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['cold3', 'cold2'],
            relevantSectionRequirements: [
                "Must contain Microsoft partnership discussion",
                "Must contain acquisition discussion",
                "Must include context about priority and next steps"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle technical talent outreach', async () => {
        const input = {
            opportunities,
            transcript: `
                CTO: Let's review the senior candidate inbounds.
                
                Sarah Chen (ml.sarah.chen@gmail.com) looks very strong.
                ML Lead: Yes, her background in transformer models is exactly what we need.
                Tech Lead: And she's led teams at Google and Meta.
                CTO: Let's fast-track this one.
                
                Also got a mobile lead candidate.
                iOS Lead: Yes, mobile_ninja has great React Native experience.
                Android Lead: Their open source contributions are impressive too.
                CTO: Good fit for our mobile team expansion.
            `,
            modelConfig: MODEL_TO_TEST
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['cold1', 'cold4'],
            relevantSectionRequirements: [
                "Must include full discussion of ML candidate's background",
                "Must include mobile lead candidate evaluation",
                "Must capture technical assessment details"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle investor and media outreach', async () => {
        const input = {
            opportunities,
            transcript: `
                CEO: Two interesting inbounds to discuss.
                
                @vc_partner from Sequoia is interested in leading our B round.
                CFO: Their term sheet looks competitive, 20% better than others.
                CEO: And they have great enterprise SaaS experience.
                
                Also, @tech_influencer wants to cover our AI features.
                Marketing: They have 500K tech followers, could be good exposure.
                Product: Perfect timing with our GPT-4 integration launch.
            `,
            modelConfig: MODEL_TO_TEST
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['cold5', 'cold8'],
            relevantSectionRequirements: [
                "Must include VC discussion and term sheet details",
                "Must include tech blogger coverage opportunity",
                "Must capture strategic value of both opportunities"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle urgent security and enterprise inbounds', async () => {
        const input = {
            opportunities,
            transcript: `
                CTO: We have an urgent security report from security_white_hat.
                Security: They identified a potential SQL injection vulnerability.
                DevOps: Initial review confirms it's valid but not yet exploited.
                CTO: Let's prioritize this and prep a fix.

                Sales: Also, director_of_eng from Netflix reached out.
                Enterprise: They're interested in our enterprise plan, 2000+ seats.
                Sales: Current usage at their POC is very promising.
            `,
            modelConfig: MODEL_TO_TEST
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['cold9', 'cold7'],
            relevantSectionRequirements: [
                "Must include security vulnerability report details",
                "Must include enterprise customer opportunity",
                "Must capture urgency and priority context"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle unqualified or irrelevant outreach', async () => {
        const input = {
            opportunities,
            transcript: `
                Sales: Quick review of some other inbounds.
                
                Got a few cold emails about link exchange opportunities.
                Marketing: These look like automated spam outreach.
                
                Someone asking about internships for next summer.
                HR: We're not running an internship program currently.
                
                And some random cryptocurrency partnership spam.
                CEO: Yeah, let's skip all of these.
            `,
            modelConfig: MODEL_TO_TEST
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 0,
            relevantSectionRequirements: [
                "Must not contain any matching opportunities",
                "Must be focused on unqualified or irrelevant outreach"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
    }, 30000)

    // Keep the default model config test
    it('should use default model config when not provided', async () => {
        const input = {
            opportunities,
            transcript: `
                Sales: Quick review of Microsoft partnership opportunity.
                Team: Looks promising, good enterprise fit.
                Sales: Will follow up with john.smith@microsoft.com.
            `
        }

        const result = await analyzeBulkTranscript(input)

        expect(result.metadata.modelName).toBe("gpt-4o")
        expect(result.metadata.temperature).toBe(0)
        expect(result.metadata.maxTokens).toBeUndefined()
        expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0)
    }, 30000)
}) 