import { describe, it, expect } from 'vitest'
import { analyzeBulkTranscript } from './process'
import OpenAI from 'openai'

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

// Test different model configurations
const MODEL_CONFIGS = {
    // GPT4O_MINI: {
    //     modelName: "gpt-4o-mini",
    //     temperature: 0,
    // },
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

describe('analyzeBulkTranscript', () => {
    const opportunities = [
        {
            id: 'opp1',
            initial_content: 'Interested in discussing AI collaboration',
            status: 'pending',
            sender_handle: 'ai_researcher'
        },
        {
            id: 'opp2',
            initial_content: 'Would love to discuss blockchain technology',
            status: 'pending',
            sender_handle: 'crypto_dev'
        },
        {
            id: 'opp3',
            initial_content: 'Potential partnership for IoT project',
            status: 'approved',
            sender_handle: 'iot_expert'
        }
    ]

    // Run each test with each model configuration
    Object.entries(MODEL_CONFIGS).forEach(([modelName, modelConfig]) => {
        describe(`Using ${modelName}`, () => {
            it('should identify multiple opportunities in a transcript', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Host: Let's go through today's opportunities.
            
            First, about the AI collaboration proposal.
            Guest: Yes, I think we should move forward with that one.
            Host: Agreed, their expertise looks solid.
            
            Now, about the blockchain discussion.
            Guest: I'm not sure about that one, seems too promotional.
            Host: Yes, let's pass on that.
            
            That's all for today's review.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)
                const evaluation = await evaluateResults(input.transcript, result, {
                    expectedOpportunityCount: 2,
                    expectedOpportunityIds: ['opp1', 'opp2'],
                    relevantSectionRequirements: [
                        "Must contain 'First, about the AI collaboration proposal'",
                        "Must contain 'Now, about the blockchain discussion'",
                        "Must include complete discussion sections"
                    ]
                })

                expect(evaluation.passed).toBe(true)
                expect(evaluation.relevantSectionsValid).toBe(true)
                expect(evaluation.opportunityCountValid).toBe(true)
                expect(evaluation.opportunityIdsValid).toBe(true)
            }, 30000)

            it('should handle transcripts with no matching opportunities', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Host: Today we're discussing something completely different.
            Guest: Yes, let's talk about marketing strategies.
            Host: Great idea, marketing is key.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)
                expect(result.identifiedOpportunities).toHaveLength(0)

                const evaluation = await evaluateResults(input.transcript, result, {
                    expectedOpportunityCount: 0,
                    relevantSectionRequirements: [
                        "Must not contain any opportunity discussions",
                        "Must be focused on unrelated topics"
                    ]
                })

                expect(evaluation.passed).toBe(true)
                expect(evaluation.opportunityCountValid).toBe(true)
            }, 30000)

            it('should provide accurate relevant sections', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Host: Quick updates:
            
            The AI collaboration looks very promising,
            we've reviewed their background thoroughly
            and want to proceed immediately.
            
            Someone mentioned blockchain but we didn't
            really discuss it in detail.
            
            The IoT project was briefly mentioned
            but we'll cover it next time.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                // Validate metadata
                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                expect(result.metadata.maxTokens).toBeUndefined()
                expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0)

                const evaluation = await evaluateResults(input.transcript, result, {
                    expectedOpportunityCount: 3,
                    expectedOpportunityIds: ['opp1', 'opp2', 'opp3'],
                    relevantSectionRequirements: [
                        "Must contain 'The AI collaboration looks very promising'",
                        "Must contain 'Someone mentioned blockchain'",
                        "Must contain 'The IoT project was briefly mentioned'"
                    ]
                })

                expect(evaluation.passed).toBe(true)
                expect(evaluation.relevantSectionsValid).toBe(true)
                expect(evaluation.opportunityCountValid).toBe(true)
                expect(evaluation.opportunityIdsValid).toBe(true)
            }, 30000)
        })
    })

    // Keep the default model config test
    it('should use default model config when not provided', async () => {
        const input = {
            opportunities,
            transcript: `
        Host: Let's review the ai_researcher proposal.
        Team: Strong technical background.
        Host: Approved for next steps.
      `
        }

        const result = await analyzeBulkTranscript(input)

        expect(result.metadata.modelName).toBe("gpt-4o")
        expect(result.metadata.temperature).toBe(0)
        expect(result.metadata.maxTokens).toBeUndefined()
        expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0)
    }, 30000)
})

// Add this after the existing describe blocks but before the end of the file
describe.only('Transcript Scenarios', () => {
    const opportunities = [
        {
            id: 'tech1',
            initial_content: 'Proposing new cloud migration strategy',
            status: 'pending',
            sender_handle: 'cloud_architect'
        },
        {
            id: 'tech2',
            initial_content: 'ML model optimization service',
            status: 'pending',
            sender_handle: 'ml_expert'
        },
        {
            id: 'tech3',
            initial_content: 'Security audit partnership',
            status: 'pending',
            sender_handle: 'security_lead'
        },
        {
            id: 'tech4',
            initial_content: 'Frontend performance optimization proposal',
            status: 'pending',
            sender_handle: 'sarahjohnson123@gmail.com'
        },
        {
            id: 'tech5',
            initial_content: 'Database clustering solution',
            status: 'pending',
            sender_handle: 'michael.smith.db@company.com'
        },
        {
            id: 'tech6',
            initial_content: 'DevOps automation framework',
            status: 'pending',
            sender_handle: 'robert.wilson1990@devteam.org'
        },
        {
            id: 'tech7',
            initial_content: 'Design proposal from @design_ninja',
            status: 'pending',
            sender_handle: '@design_ninja'
        },
        {
            id: 'tech8',
            initial_content: 'API architecture from John Doe',
            status: 'pending',
            sender_handle: 'john_doe_dev'
        },
        {
            id: 'tech9',
            initial_content: 'QA testing framework from qa_master',
            status: 'pending',
            sender_handle: 'qa_master'
        }
    ]

    it('should handle mixed technical discussion with multiple opportunities', async () => {
        const input = {
            opportunities,
            transcript: `
                CTO: Let's review the technical proposals.
                
                First, cloud_architect's migration strategy looks solid.
                Team Lead: Yes, their approach to microservices is well thought out.
                DevOps: And it aligns with our scalability goals.
                
                About the ML optimization service...
                Data Scientist: The benchmarks are impressive.
                ML Lead: But we need more details on the training pipeline.
                
                Security wasn't discussed much today.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['tech1', 'tech2'],
            relevantSectionRequirements: [
                "Must contain 'cloud_architect's migration strategy looks solid'",
                "Must contain 'About the ML optimization service'",
                "Must include complete discussion threads"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle enthusiastic single-opportunity discussion', async () => {
        const input = {
            opportunities,
            transcript: `
                CTO: Let's discuss the cloud migration proposal.
                Team: The architecture design is impressive!
                DevOps: Their microservices approach is exactly what we need.
                Architect: This could transform our entire infrastructure.
                Lead: Their previous migrations show great results.
                CTO: Perfect, let's move forward with cloud_architect's proposal.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 1,
            expectedOpportunityIds: ['tech1'],
            relevantSectionRequirements: [
                "Must contain the entire discussion about cloud migration",
                "Must include all team member comments showing enthusiasm",
                "Must reference cloud_architect"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle indirect references and mentions', async () => {
        const input = {
            opportunities,
            transcript: `
                CTO: Our infrastructure needs modernization.
                DevOps: Yes, we need expertise in cloud architecture.
                Lead: I reviewed that migration proposal earlier.
                Architect: The containerization approach would help.
                Team: And their experience with similar transitions is solid.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 1,
            expectedOpportunityIds: ['tech1'],
            relevantSectionRequirements: [
                "Must include the complete context about infrastructure modernization",
                "Must capture the technical discussion about cloud architecture",
                "Must include references to migration and containerization"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle critical technical discussion', async () => {
        const input = {
            opportunities,
            transcript: `
                Security Lead: Regarding the ML service proposal...
                Engineer: The model accuracy is concerning.
                Data Scientist: And the training data isn't well documented.
                ML Lead: I agree, ml_expert's approach needs work.
                Team Lead: Let's hold off for now.
                
                We should also review the security audit proposal,
                but security_lead couldn't make it today.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['tech2', 'tech3'],
            relevantSectionRequirements: [
                "Must include critical ML discussion",
                "Must mention security audit briefly"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
    }, 30000)

    it('should handle unrelated technical discussion', async () => {
        const input = {
            opportunities,
            transcript: `
                PM: Let's discuss the website redesign.
                Designer: The new mockups are ready.
                Frontend: We've updated the component library.
                Backend: API documentation is complete.
                QA: Testing plan is in place.
                PM: Great progress everyone!
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 0,
            relevantSectionRequirements: [
                "Must not contain any opportunity discussions",
                "Must be focused on unrelated project work"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
    }, 30000)

    it('should match opportunities by email handle variations', async () => {
        const input = {
            opportunities,
            transcript: `
                PM: Sarah's frontend optimization looks promising.
                Team: Yes, her performance metrics are impressive.
                Dev: I reviewed the proposal from sarahjohnson123@gmail.com.
                Lead: The bundle size reduction approach is solid.
                
                Also, Mike from DB team suggested a clustering solution.
                Architect: Yes, Michael's approach to sharding is well-thought-out.
                DBA: The scalability tests look good.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['tech4', 'tech5'],
            relevantSectionRequirements: [
                "Must include discussion about Sarah's frontend optimization",
                "Must include discussion about Michael's database solution",
                "Must capture full context for both opportunities"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle email handle first names and variations', async () => {
        const input = {
            opportunities,
            transcript: `
                Lead: Bob's automation framework is interesting.
                DevOps: Yes, Robert really knows his stuff.
                Team: The CI/CD pipeline design is comprehensive.
                Architect: And it integrates well with our existing tools.
                PM: Let's schedule a deep dive with robert.wilson1990@devteam.org.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 1,
            expectedOpportunityIds: ['tech6'],
            relevantSectionRequirements: [
                "Must include discussion about Bob/Robert's automation framework",
                "Must capture the entire technical discussion",
                "Must include the email reference"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should match opportunities by social media handles with @ symbol', async () => {
        const input = {
            opportunities,
            transcript: `
                PM: The design proposal from @design_ninja looks amazing.
                Team: Yes, their portfolio shows great UX sensibility.
                Designer: The wireframes are very innovative.
                Lead: And it aligns with our brand guidelines.
                
                Also, John Doe's API architecture looks solid.
                Backend: Yes, @john_doe_dev really understands our scaling needs.
                Team: The documentation is comprehensive too.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['tech7', 'tech8'],
            relevantSectionRequirements: [
                "Must include discussion about @design_ninja's proposal",
                "Must include discussion about John Doe's API architecture",
                "Must capture full context for both opportunities"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle social media handles without @ symbol and platform-specific formats', async () => {
        const input = {
            opportunities,
            transcript: `
                Lead: design_ninja's mockups are exactly what we need.
                UX: The user flow is well thought out.
                PM: Their previous work on similar projects is impressive.
                
                QA: The testing framework from qa_master looks promising.
                Dev: Yes, their approach to E2E testing is comprehensive.
                Lead: And it integrates well with our CI pipeline.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 2,
            expectedOpportunityIds: ['tech7', 'tech9'],
            relevantSectionRequirements: [
                "Must include discussion about design_ninja's mockups",
                "Must include discussion about qa_master's testing framework",
                "Must capture technical details and team feedback"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)

    it('should handle mixed social, email, and regular handle references', async () => {
        const input = {
            opportunities,
            transcript: `
                PM: Let's review the proposals:
                
                First, design_ninja submitted great mockups.
                Team: The UX improvements are significant.
                
                Sarah from frontend team (sarahjohnson123@gmail.com)
                has some performance optimizations to discuss.
                
                And cloud_architect's migration strategy
                looks well-planned.
            `
        }

        const result = await analyzeBulkTranscript(input)
        const evaluation = await evaluateResults(input.transcript, result, {
            expectedOpportunityCount: 3,
            expectedOpportunityIds: ['tech7', 'tech4', 'tech1'],
            relevantSectionRequirements: [
                "Must include discussion about design_ninja's mockups",
                "Must include Sarah's frontend performance discussion",
                "Must include cloud_architect's migration strategy",
                "Must maintain context for each opportunity"
            ]
        })

        expect(evaluation.passed).toBe(true)
        expect(evaluation.relevantSectionsValid).toBe(true)
        expect(evaluation.opportunityCountValid).toBe(true)
        expect(evaluation.opportunityIdsValid).toBe(true)
    }, 30000)
}) 