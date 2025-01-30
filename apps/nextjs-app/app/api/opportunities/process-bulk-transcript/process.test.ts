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
    describe('Startup Company Scenarios', () => {
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
    })

    describe('Mr. Beast Scenarios', () => {
        const opportunities = [
            {
                id: 'beast1',
                initial_content: 'Major food chain wants to do $1M restaurant takeover challenge',
                status: 'pending',
                sender_handle: '@mcdonalds'
            },
            {
                id: 'beast2',
                initial_content: 'Gaming peripheral company proposing $500K tournament sponsorship',
                status: 'pending',
                sender_handle: 'partnerships@razer.com'
            },
            {
                id: 'beast3',
                initial_content: 'Charity organization seeking collaboration for ocean cleanup',
                status: 'pending',
                sender_handle: 'teamtrees@foundation.org'
            },
            {
                id: 'beast4',
                initial_content: 'Streaming platform offering exclusive contract',
                status: 'pending',
                sender_handle: 'creator_partnerships@rumble.com'
            },
            {
                id: 'beast5',
                initial_content: 'Tech startup wants to sponsor $2M last-to-leave challenge',
                status: 'pending',
                sender_handle: 'ceo@techstartup.com'
            },
            {
                id: 'beast6',
                initial_content: 'Shopping mall proposing 24-hour spending spree video',
                status: 'pending',
                sender_handle: '@mallofamerica'
            }
        ]

        it('should identify high-value challenge sponsorships', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Let's review today's partnership opportunities.
                    
                    First, McDonald's wants to do a massive restaurant challenge.
                    Team: @mcdonalds is offering $1M for a store takeover video.
                    Creative: We could give away everything to customers for free.
                    Manager: Perfect fit for our format.
                    
                    Also, that tech startup reached out about a challenge.
                    Production: Yes, ceo@techstartup.com proposed $2M for last-to-leave.
                    Team: Could work well with their new smart home products.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['beast1', 'beast5'],
                relevantSectionRequirements: [
                    "Must include McDonald's challenge discussion",
                    "Must include tech startup challenge details",
                    "Must capture budget and concept details"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should handle charity and impact opportunities', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Let's discuss the TeamTrees collaboration.
                    Impact Lead: teamtrees@foundation.org wants to do ocean cleanup.
                    Creative: Could make great content while helping the environment.
                    Team: Like TeamTrees but for oceans.
                    Manager: Definitely aligns with our mission.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['beast3'],
                relevantSectionRequirements: [
                    "Must include charity collaboration discussion",
                    "Must capture environmental impact angle",
                    "Must include mission alignment context"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should handle gaming and tech sponsorships', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Two gaming deals to review.
                    
                    Razer reached out about a tournament.
                    Team: partnerships@razer.com wants to sponsor a $500K gaming event.
                    Production: Could do a massive multiplayer challenge.
                    Manager: Great fit for the gaming audience.
                    
                    Also got a streaming platform deal.
                    Legal: creator_partnerships@rumble.com is offering exclusivity.
                    Team: They want first rights to all new content.
                    Manager: Let's review the terms carefully.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['beast2', 'beast4'],
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should evaluate retail and mall collaborations', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Mall of America proposal came in.
                    Team: @mallofamerica wants to do a 24-hour challenge.
                    Creative: We could let fans spend unlimited money.
                    Manager: Perfect for holiday season content.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['beast6'],
                relevantSectionRequirements: [
                    "Must include mall collaboration details",
                    "Must capture creative concept",
                    "Must include timing and strategic fit"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)
    })

    describe('Kanye Scenarios', () => {
        const opportunities = [
            {
                id: 'ye1',
                initial_content: 'Luxury fashion house seeking creative director collaboration',
                status: 'pending',
                sender_handle: 'creative@balenciaga.com'
            },
            {
                id: 'ye2',
                initial_content: 'Major sneaker brand offering new line deal',
                status: 'pending',
                sender_handle: '@adidasoriginals'
            },
            {
                id: 'ye3',
                initial_content: 'Music streaming platform offering exclusive album rights',
                status: 'pending',
                sender_handle: 'deals@tidal.com'
            },
            {
                id: 'ye4',
                initial_content: 'Tech company interested in smart speaker collaboration',
                status: 'pending',
                sender_handle: 'partnerships@apple.com'
            },
            {
                id: 'ye5',
                initial_content: 'Fashion week seeking headline show slot',
                status: 'pending',
                sender_handle: '@parisfashionweek'
            },
            {
                id: 'ye6',
                initial_content: 'Social platform offering exclusive content partnership',
                status: 'pending',
                sender_handle: '@instagram'
            }
        ]

        it('should handle fashion and luxury collaborations', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Two major fashion opportunities to review.
                    
                    Balenciaga reached out about creative director role.
                    Fashion Lead: creative@balenciaga.com sent the full proposal.
                    Team: Would give complete creative control over next collection.
                    
                    Also, @parisfashionweek offered headline slot.
                    PR: They want YEEZY as main event.
                    Team: Could debut the new collection there.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['ye1', 'ye5'],
                relevantSectionRequirements: [
                    "Must include Balenciaga creative role discussion",
                    "Must include fashion week headline opportunity",
                    "Must capture creative control and showcase aspects"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should evaluate platform and streaming deals', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Let's review the platform deals.
                    
                    Tidal is offering exclusive rights for the new album.
                    Legal: deals@tidal.com sent over the contract.
                    Team: They're offering higher streaming percentages.
                    
                    @instagram also reached out about exclusive content.
                    Digital: They want YEEZY collection drops to be Instagram-first.
                    PR: Could be huge for direct-to-consumer strategy.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['ye3', 'ye6'],
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should handle tech and hardware collaborations', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Apple's proposal is interesting.
                    Tech: partnerships@apple.com wants to do a smart speaker collab.
                    Design: Could integrate YEEZY aesthetics with HomePod.
                    Manager: Unique blend of fashion and tech.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['ye4'],
                relevantSectionRequirements: [
                    "Must include tech collaboration details",
                    "Must capture design integration aspects",
                    "Must include strategic positioning"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should evaluate sneaker and sportswear deals', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Adidas wants to renew the partnership.
                    Design: @adidasoriginals proposed a new sneaker line.
                    Team: Full creative control and higher royalties.
                    Manager: Could be bigger than previous collections.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['ye2'],
                relevantSectionRequirements: [
                    "Must include sneaker line details",
                    "Must capture creative control aspects",
                    "Must include business terms"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)
    })

    describe('Email Matching Edge Cases', () => {
        const opportunities = [
            {
                id: 'email1',
                initial_content: 'First email sender proposal about AI chatbot integration',
                status: 'pending',
                sender_handle: 'john.smith@email.com'
            },
            {
                id: 'email2',
                initial_content: 'Second email sender proposal about mobile app redesign',
                status: 'pending',
                sender_handle: 'john.doe@email.com'
            },
            {
                id: 'email3',
                initial_content: 'Similar but different email about cloud migration',
                status: 'pending',
                sender_handle: 'john.smith.different@email.com'
            },
            {
                id: 'email4',
                initial_content: 'Proposal for new security framework implementation',
                status: 'pending',
                sender_handle: 'different.person@email.com'
            }
        ]

        it('should only match exact email addresses', async () => {
            const input = {
                opportunities,
                transcript: `
                    Team: Let's review the proposal from john.smith@email.com
                    Manager: Yes, their proposal looks good.
                    Team: Approved.

                    Also got something from john.smith.different@email.com
                    Manager: Different person, different proposal.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['email1', 'email3'],
                relevantSectionRequirements: [
                    "Must match exact email addresses only",
                    "Must not match partial email matches",
                    "Must include full discussion context for each match"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should not match similar but different email addresses', async () => {
            const input = {
                opportunities,
                transcript: `
                    Team: Got a message from john.smith.different@email.com
                    Manager: Let's review it.
                    Team: Looks good.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['email3'],
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should handle email address case sensitivity correctly', async () => {
            const input = {
                opportunities,
                transcript: `
                    Team: Reviewing JOHN.SMITH@EMAIL.COM's proposal
                    Manager: Same as john.smith@email.com, just different case
                    Team: Yes, approve it.

                    Also got one from DIFFERENT.PERSON@EMAIL.COM
                    Manager: That's different.person@email.com in lowercase
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['email1', 'email4'],
                relevantSectionRequirements: [
                    "Must handle case-insensitive email matching",
                    "Must treat uppercase and lowercase emails as the same",
                    "Must include full discussion context"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should not match partial email addresses', async () => {
            const input = {
                opportunities,
                transcript: `
                    Team: Message from john.smith
                    Manager: Just the name, not the full email
                    Team: Noted.

                    Also from @email.com
                    Manager: Just the domain, not helpful.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 0,
                relevantSectionRequirements: [
                    "Must not match partial email addresses",
                    "Must require complete email address for matching"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
        }, 30000)

        it('should match opportunities by content without requiring email mention', async () => {
            const input = {
                opportunities,
                transcript: `
                    Team: Let's discuss the AI chatbot integration proposal.
                    Tech: The integration approach looks solid.
                    Manager: Yes, this aligns with our roadmap.
                    Team: Approved.

                    Also reviewing the security framework proposal.
                    Security: Their implementation plan is comprehensive.
                    Manager: Good, let's move forward with both.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['email1', 'email4'],
                relevantSectionRequirements: [
                    "Must match opportunities based on content discussion",
                    "Must not require email address mention",
                    "Must include full context of technical discussion"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should match by both email and content in mixed discussions', async () => {
            const input = {
                opportunities,
                transcript: `
                    Team: The cloud migration proposal needs review.
                    Tech: Yes, the approach from john.smith.different@email.com is solid.
                    Manager: Approved.

                    Also got a mobile app redesign proposal.
                    Design: The new UX flows look great.
                    PM: And it fits our Q2 objectives.
                    Manager: Who sent this one?
                    Team: That's from john.doe@email.com.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['email3', 'email2'],
                relevantSectionRequirements: [
                    "Must match opportunities by both email and content",
                    "Must handle mixed reference types in same discussion",
                    "Must include full context regardless of match type"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should prioritize content matches when email is ambiguous', async () => {
            const input = {
                opportunities,
                transcript: `
                    Team: We have a proposal about AI integration.
                    Tech: The chatbot design is innovative.
                    Manager: And it's from someone at email.com
                    Team: Yes, but let's focus on the technical merit.
                    Manager: Agreed, the AI approach is solid. Approve it.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['email1'],
                relevantSectionRequirements: [
                    "Must match based on content when email is ambiguous",
                    "Must focus on technical discussion relevance",
                    "Must include full context of proposal evaluation"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should handle simple email approval with VR fitness opportunity', async () => {
            const vrOpportunities = [
                ...opportunities,
                {
                    id: 'vr1',
                    initial_content: 'Hello HyperAgentMan, My name is Lisa from TechConnect Innovators, and we are looking to collaborate with you on a cutting-edge virtual reality project that aims to revolutionize fitness training. We believe your unique influence and expertise in tech-driven initiatives would be a perfect fit for our campaign. Would you be interested in discussing this exciting opportunity further? Best regards, Lisa',
                    status: 'pending',
                    sender_handle: 'London.Mertz@hotmail.com'
                }
            ]

            const input = {
                opportunities: vrOpportunities,
                transcript: `approve London.Mertz@hotmail.com please`,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['vr1'],
                relevantSectionRequirements: [
                    "Must match exact email address",
                    "Must identify approval intent",
                    "Must handle simple one-line approval command"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)
    })

    // Keep the default model config test outside all describes
    it('should use default model config when not provided', async () => {
        const defaultOpportunities = [
            {
                id: 'cold3',
                initial_content: 'Enterprise sales partnership opportunity from Microsoft',
                status: 'pending',
                sender_handle: 'john.smith@microsoft.com'
            }
        ]

        const input = {
            opportunities: defaultOpportunities,
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

    describe('Taylor Swift Scenarios', () => {
        const opportunities = [
            {
                id: 'taylor1',
                initial_content: 'Major film studio proposing concert movie deal',
                status: 'pending',
                sender_handle: 'theatrical@universal.com'
            },
            {
                id: 'taylor2',
                initial_content: 'Luxury brand seeking tour wardrobe collaboration',
                status: 'pending',
                sender_handle: '@versace'
            },
            {
                id: 'taylor3',
                initial_content: 'Stadium proposing record-breaking residency',
                status: 'pending',
                sender_handle: 'events@sofi.com'
            },
            {
                id: 'taylor4',
                initial_content: 'Tech company offering custom AI voice model partnership',
                status: 'pending',
                sender_handle: 'partnerships@openai.com'
            },
            {
                id: 'taylor5',
                initial_content: 'Streaming platform proposing documentary series',
                status: 'pending',
                sender_handle: 'originals@netflix.com'
            },
            {
                id: 'taylor6',
                initial_content: 'Beauty brand seeking signature fragrance line',
                status: 'pending',
                sender_handle: '@sephora'
            }
        ]

        it('should handle entertainment and media deals', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Universal wants to do a concert film.
                    Team: theatrical@universal.com is offering global distribution.
                    Creative: Could include behind-the-scenes from all tour dates.
                    Manager: Perfect timing with tour success.

                    Netflix also reached out.
                    Content: originals@netflix.com wants a documentary series.
                    Team: They're offering creative control and huge budget.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['taylor1', 'taylor5'],
                relevantSectionRequirements: [
                    "Must include film distribution details",
                    "Must include documentary series proposal",
                    "Must capture creative aspects of both projects"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should evaluate fashion and beauty collaborations', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Two major brand collaborations to discuss.
                    
                    @versace wants to do tour wardrobe.
                    Design: They'll create custom pieces for each act.
                    Team: Could include retail collection too.
                    
                    Also, @sephora reached out about fragrance.
                    Beauty: They want a signature scent line.
                    Marketing: Could tie it to different album eras.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['taylor2', 'taylor6'],
                relevantSectionRequirements: [
                    "Must include fashion collaboration details",
                    "Must include beauty line proposal",
                    "Must capture brand synergy aspects"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should handle tech and innovation partnerships', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Interesting AI proposal from OpenAI.
                    Tech: partnerships@openai.com wants to create a voice model.
                    Legal: Would be for approved uses only.
                    Manager: Could revolutionize fan experiences.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['taylor4'],
                relevantSectionRequirements: [
                    "Must include AI partnership details",
                    "Must capture innovation aspects",
                    "Must include legal considerations"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should evaluate venue and touring opportunities', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: SoFi Stadium has an amazing proposal.
                    Touring: events@sofi.com wants a record-breaking residency.
                    Team: Could do multiple weekends over several months.
                    Production: Would allow for permanent stage setup.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 1,
                expectedOpportunityIds: ['taylor3'],
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)
    })

    describe('Elon Musk Scenarios', () => {
        const opportunities = [
            {
                id: 'elon1',
                initial_content: 'Space tourism company seeking launch partnership',
                status: 'pending',
                sender_handle: 'partnerships@virgingalactic.com'
            },
            {
                id: 'elon2',
                initial_content: 'AI research lab proposing joint venture',
                status: 'pending',
                sender_handle: 'research@deepmind.com'
            },
            {
                id: 'elon3',
                initial_content: 'Battery manufacturer offering exclusive supply deal',
                status: 'pending',
                sender_handle: 'deals@panasonic.com'
            },
            {
                id: 'elon4',
                initial_content: 'Government space agency discussing Mars mission',
                status: 'pending',
                sender_handle: 'collaboration@nasa.gov'
            },
            {
                id: 'elon5',
                initial_content: 'Quantum computing startup seeking investment',
                status: 'pending',
                sender_handle: 'ceo@quantumtech.ai'
            },
            {
                id: 'elon6',
                initial_content: 'Solar technology company proposing merger',
                status: 'pending',
                sender_handle: 'bd@solartech.com'
            }
        ]

        it('should handle space exploration partnerships', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Two major space collaboration proposals.
                    
                    Virgin Galactic reached out about tourism.
                    Space: partnerships@virgingalactic.com wants launch partnership.
                    Team: Could combine our technologies for civilian space travel.
                    
                    NASA also has an interesting proposal.
                    Tech: collaboration@nasa.gov wants to discuss Mars mission.
                    Research: Would involve multiple launches and shared research.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['elon1', 'elon4'],
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should evaluate AI and quantum computing opportunities', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Two cutting-edge tech proposals.
                    
                    DeepMind wants to collaborate on AI.
                    Research: research@deepmind.com proposed a joint venture.
                    Tech: Would focus on advanced neural networks.
                    
                    Also got an interesting quantum proposal.
                    Innovation: ceo@quantumtech.ai is seeking investment.
                    Team: Their quantum algorithms could revolutionize our AI.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['elon2', 'elon5'],
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should handle energy and battery partnerships', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Let's review energy sector proposals.
                    
                    Panasonic has a new battery deal.
                    Manufacturing: deals@panasonic.com offers exclusive supply.
                    Tech: New chemistry could increase range by 50%.
                    
                    SolarTech also reached out.
                    Strategy: bd@solartech.com is proposing a merger.
                    Team: Their solar tech would complement our energy business.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['elon3', 'elon6'],
                relevantSectionRequirements: [
                    "Must include battery supply deal details",
                    "Must include solar technology merger",
                    "Must capture energy sector strategy"
                ]
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)

        it('should evaluate cross-industry innovation opportunities', async () => {
            const input = {
                opportunities,
                transcript: `
                    Manager: Several interesting cross-industry proposals.
                    
                    The quantum computing startup has potential.
                    Tech: ceo@quantumtech.ai's algorithms could optimize manufacturing.
                    Research: Would give us an edge in AI and automation.
                    
                    Virgin Galactic synergy is interesting too.
                    Space: partnerships@virgingalactic.com's tech could help Mars missions.
                    Strategy: Tourism revenue could fund deeper space exploration.
                `,
                modelConfig: MODEL_TO_TEST
            }

            const result = await analyzeBulkTranscript(input)
            const evaluation = await evaluateResults(input.transcript, result, {
                expectedOpportunityCount: 2,
                expectedOpportunityIds: ['elon5', 'elon1'],
            })

            expect(evaluation.passed).toBe(true)
            expect(evaluation.relevantSectionsValid).toBe(true)
            expect(evaluation.opportunityCountValid).toBe(true)
            expect(evaluation.opportunityIdsValid).toBe(true)
        }, 30000)
    })
}) 