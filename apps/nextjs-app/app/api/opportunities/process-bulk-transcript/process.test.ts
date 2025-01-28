import { describe, it, expect } from 'vitest'
import { analyzeBulkTranscript } from './process'

// Test different model configurations
const MODEL_CONFIGS = {
    GPT4O_MINI: {
        modelName: "gpt-4o-mini",
        temperature: 0,
    },
    GPT4O: {
        modelName: "gpt-4o",
        temperature: 0,
    },
    DEEPSEEK: {
        modelName: "deepseek-chat",
        temperature: 0,
        baseURL: "https://api.deepseek.com",
        apiKey: process.env.DEEPSEEK_API_KEY
    }
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

    // Add new test group for alternative reference formats
    describe('Alternative Reference Tests', () => {
        it('should identify opportunities by email and role references', async () => {
            const testOpportunities = [
                {
                    id: 'opp1',
                    initial_content: 'Looking for product design role',
                    status: 'pending',
                    sender_handle: 'product_designer'
                },
                {
                    id: 'opp2',
                    initial_content: 'Interested in coaching position',
                    status: 'pending',
                    sender_handle: 'dating_coach'
                },
                {
                    id: 'opp3',
                    initial_content: 'Hi there',
                    status: 'pending',
                    sender_handle: 'attractive.woman@abc.com'
                }
            ]

            const input = {
                opportunities: testOpportunities,
                transcript: `
                    Okay, welcome to the meeting everyone. 
                    I'm looking at attractive.woman@abc.com. I think that would be worth approving. 
                    So let's do that in terms of the product designer, seems like a legitimate person. Let's go, let's move forward with that one. 
                    And then in terms of the dating coach, let's move forward with that one as well.
                `,
                modelConfig: MODEL_CONFIGS.GPT4O
            }

            const result = await analyzeBulkTranscript(input)

            expect(result.identifiedOpportunities).toHaveLength(3)

            // Check email reference
            const emailOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
            expect(emailOpp).toBeDefined()
            expect(emailOpp?.confidence).toBeGreaterThan(0.7)
            expect(emailOpp?.relevantSection).toMatch(/attractive\.woman@abc\.com.*worth approving/)

            // Check role reference - product designer
            const designerOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
            expect(designerOpp).toBeDefined()
            expect(designerOpp?.confidence).toBeGreaterThan(0.7)
            expect(designerOpp?.relevantSection).toMatch(/product designer.*move forward/)

            // Check role reference - dating coach
            const coachOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
            expect(coachOpp).toBeDefined()
            expect(coachOpp?.confidence).toBeGreaterThan(0.7)
            expect(coachOpp?.relevantSection).toMatch(/dating coach.*move forward/)
        }, 30000)
    })

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

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                expect(result.identifiedOpportunities).toHaveLength(2)
                expect(result.identifiedOpportunities.map(o => o.id)).toContain('opp1')
                expect(result.identifiedOpportunities.map(o => o.id)).toContain('opp2')

                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThan(0.7)
                expect(aiOpp?.relevantSection).toMatch(/AI collaboration[\s\S]*expertise looks solid/)

                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(blockchainOpp?.confidence).toBeGreaterThan(0.5)
                expect(blockchainOpp?.relevantSection).toMatch(/blockchain discussion[\s\S]*seems too promotional/)
            }, 30000)

            it('should identify opportunities by sender handle', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Host: Let's review the pending requests.
            
            The ai_researcher should be approved.
            Guest: Yes, their background is impressive.
            
            What about crypto_dev?
            Host: Not a good fit for us right now.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                expect(result.identifiedOpportunities).toHaveLength(2)
                expect(result.identifiedOpportunities.map(o => o.id)).toContain('opp1')
                expect(result.identifiedOpportunities.map(o => o.id)).toContain('opp2')

                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThan(0.7)
                expect(aiOpp?.relevantSection).toMatch(/ai_researcher[\s\S]*should be approved/)
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

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                expect(result.identifiedOpportunities).toHaveLength(0)
            }, 30000)

            it('should extract relevant sections accurately', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Host: Welcome everyone.
            
            Let's discuss the IoT project first.
            Guest: The technical specs look good.
            Host: Yes, and they have a strong team.
            Guest: Should we proceed?
            Host: Yes, let's move forward.

            Other topic: Marketing budget review.
            Guest: We need to increase it.
            Host: Agreed, let's plan that.

            Finally, the AI collaboration.
            Guest: Their proposal is interesting.
            Host: But we need more details.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)

                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.relevantSection).toMatch(/IoT project[\s\S]*move forward/)
                expect(iotOpp?.relevantSection).not.toMatch(/Marketing budget/)

                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.relevantSection).toMatch(/AI collaboration[\s\S]*more details/)
                expect(aiOpp?.relevantSection).not.toMatch(/Marketing budget/)
            }, 30000)

            it('should provide accurate confidence scores', async () => {
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

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)

                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')

                // High confidence for detailed discussion
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.8)

                // Low confidence for briefly mentioned opportunities
                expect(blockchainOpp?.confidence).toBeLessThanOrEqual(0.5)
                expect(iotOpp?.confidence).toBeLessThanOrEqual(0.5)
            }, 30000)

            // Group 1: Technical Team Reviews
            it('should handle technical deep dive discussions', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Tech Lead: Let's review the AI researcher's technical background.
            Senior Dev: I've looked at their GitHub. The NLP implementations are impressive.
            ML Engineer: Their transformer architecture improvements are novel.
            Tech Lead: Any concerns about integration with our stack?
            Backend Dev: Their experience with our tech stack is solid.
            Tech Lead: Sounds like a strong technical fit.
            PM: Should we move forward with ai_researcher?
            Tech Lead: Yes, technically they're exactly what we need.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(aiOpp?.relevantSection).toMatch(/technical background[\s\S]*exactly what we need/)
            }, 30000)

            it('should identify technical red flags', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Tech Lead: Let's discuss the blockchain proposal's architecture.
            Security Lead: I found several vulnerabilities in their code samples.
            Backend Dev: Their data model isn't normalized properly.
            DevOps: And their deployment strategy is concerning.
            Tech Lead: These are serious issues.
            PM: So we should reject?
            Tech Lead: Yes, too many technical risks.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(blockchainOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(blockchainOpp?.relevantSection).toMatch(/vulnerabilities[\s\S]*technical risks/)
            }, 30000)

            // Group 2: Security Reviews
            it('should handle security audit discussions', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Security Lead: Let's review the IoT project's security assessment.
            Analyst: Their encryption protocols are industry standard.
            Pen Tester: Penetration testing showed no critical vulnerabilities.
            Compliance: They're GDPR and SOC2 compliant.
            Security Lead: This is a green light from security.
            PM: Great news. Any monitoring requirements?
            Security Lead: Standard monitoring will suffice.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(iotOpp?.relevantSection).toMatch(/security assessment[\s\S]*green light/)
            }, 30000)

            // Group 3: Legal Reviews
            it('should identify legal compliance issues', async () => {
                const input = {
                    opportunities,
                    transcript: `
            Legal: Reviewing the crypto_dev proposal.
            Compliance: Their terms violate regulatory requirements.
            Legal: I see potential liability issues too.
            Risk: And their insurance coverage is inadequate.
            Legal: This is a clear reject from legal.
            PM: Understood. I'll document the reasons.
          `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const cryptoOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(cryptoOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(cryptoOpp?.relevantSection).toMatch(/violate regulatory[\s\S]*clear reject/)
            }, 30000)

            // Group 4: Business Impact Reviews
            it('should evaluate business value propositions', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Business Lead: Let's assess the ROI for ai_researcher collaboration.
                    Finance: The revenue projections look strong.
                    Sales: This could open up new market segments.
                    Marketing: Great PR potential too.
                    Strategy: Aligns with our Q3 objectives.
                    Business Lead: Strong business case here.
                    PM: So we're moving forward with the AI collaboration?
                    Business Lead: Yes, full support from business.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(aiOpp?.relevantSection).toMatch(/ROI[\s\S]*full support/)
            }, 30000)

            // Group 5: Resource Allocation Reviews
            it('should handle resource availability discussions', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Resource Manager: Let's check capacity for the IoT project.
                    Team Lead: We need 3 senior devs for 6 months.
                    HR: That's going to be tight with current staffing.
                    Finance: Budget is available if we need to hire.
                    Resource Manager: This might delay other projects.
                    PM: Should we hold off then?
                    Resource Manager: Yes, let's revisit next quarter.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(iotOpp?.relevantSection).toMatch(/capacity[\s\S]*revisit next quarter/)
            }, 30000)

            // Group 6: Cross-functional Team Reviews
            it('should process multi-department feedback', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    PM: Cross-functional review of ai_researcher proposal.
                    Engineering: Strong technical background.
                    Design: UI/UX expertise is relevant.
                    Product: Aligns with roadmap.
                    Marketing: Good thought leadership potential.
                    Sales: Could help with enterprise deals.
                    Customer Success: Support impact is minimal.
                    PM: Sounds like universal approval for the AI collaboration.
                    Team: Agreed.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(aiOpp?.relevantSection).toMatch(/Cross-functional review[\s\S]*universal approval/)
            }, 30000)

            // Group 7: Timeline and Planning Reviews
            it('should evaluate project timeline feasibility', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    PM: Timeline review for the blockchain integration.
                    Engineering: Their 2-month estimate is unrealistic.
                    Design: We need at least 3 months for proper UX.
                    QA: And another month for testing.
                    PM: So we're looking at 6 months minimum?
                    Team: Yes, and that's optimistic.
                    PM: This doesn't match their expectations.
                    Tech Lead: Should we pass then?
                    PM: Yes, timeline mismatch is too significant.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(blockchainOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(blockchainOpp?.relevantSection).toMatch(/Timeline review[\s\S]*mismatch is too significant/)
            }, 30000)

            // Group 8: Budget Reviews
            it('should assess financial implications', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Finance: Budget review for AI collaboration.
                    Accounting: Initial cost is within Q2 budget.
                    Procurement: License fees are reasonable.
                    Finance: ROI projections look strong.
                    Legal: Payment terms are standard.
                    Finance: Any hidden costs?
                    Tech: Minimal infrastructure impact.
                    Finance: This gets finance approval then.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(aiOpp?.relevantSection).toMatch(/Budget review[\s\S]*finance approval/)
            }, 30000)

            // Group 9: Risk Assessment Reviews
            it('should identify and evaluate risks', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Risk Officer: Risk assessment for IoT project.
                    Security: Medium security risks identified.
                    Legal: Some liability exposure.
                    Finance: Currency risk is minimal.
                    Operations: Supply chain dependencies concern me.
                    Risk Officer: How manageable are these?
                    Team: We need more mitigation plans.
                    Risk Officer: Let's pause until we have those.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(iotOpp?.relevantSection).toMatch(/Risk assessment[\s\S]*pause until/)
            }, 30000)

            // Group 10: Integration Reviews
            it('should evaluate integration requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Systems Architect: Integration review for ai_researcher's AI tools.
                    Backend: API compatibility looks good.
                    Frontend: UI integration is straightforward.
                    DevOps: Deployment pipeline can handle it.
                    Data: Data migration is manageable.
                    Security: Authentication flow works.
                    Architect: Sounds like a clean integration.
                    PM: Green light from technical side?
                    Architect: Yes, no major integration hurdles.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(aiOpp?.relevantSection).toMatch(/Integration review[\s\S]*no major integration hurdles/)
            }, 30000)

            // Group 11: Scalability Reviews
            it('should assess scalability requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Tech Lead: Scalability review of blockchain proposal.
                    Performance: Current architecture won't scale.
                    Infrastructure: Would require significant upgrades.
                    DevOps: Monitoring overhead is concerning.
                    Cost: Scaling costs are unpredictable.
                    Tech Lead: These are serious scalability issues.
                    PM: Not worth the investment?
                    Tech Lead: Correct, too risky at scale.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(blockchainOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(blockchainOpp?.relevantSection).toMatch(/Scalability review[\s\S]*too risky at scale/)
            }, 30000)

            // Group 12: Customer Impact Reviews
            it('should evaluate customer impact', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Customer Success: Reviewing IoT project impact.
                    Support: Will increase ticket volume 20%.
                    Training: New documentation needed.
                    Success: But customer value is clear.
                    Sales: Existing customers are asking for this.
                    PM: Worth the support investment?
                    Success: Yes, high customer demand justifies it.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(iotOpp?.relevantSection).toMatch(/project impact[\s\S]*customer demand justifies/)
            }, 30000)

            // Group 13: Competitive Analysis Reviews
            it('should consider competitive positioning', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Strategy: Competitive analysis of ai_researcher partnership.
                    Research: Puts us ahead of main competitors.
                    Product: Unique differentiator in market.
                    Sales: Will help win competitive deals.
                    Marketing: Strong PR angle versus competitors.
                    Strategy: This could be a market leader play.
                    CEO: Sounds like a strategic win for the AI collaboration.
                    Strategy: Yes, strong competitive advantage.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(aiOpp?.relevantSection).toMatch(/Competitive analysis[\s\S]*strategic win/)
            }, 30000)

            // Group 14: Documentation Reviews
            it('should evaluate documentation quality', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Tech Writer: Documentation review for crypto_dev's blockchain SDK.
                    Dev: API docs are incomplete.
                    QA: Test cases poorly documented.
                    Support: User guides are missing.
                    Tech Writer: This needs major documentation work.
                    PM: Timeline impact?
                    Tech Writer: Months of work needed.
                    PM: That's a blocker then.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(blockchainOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(blockchainOpp?.relevantSection).toMatch(/Documentation review[\s\S]*blocker/)
            }, 30000)

            // Group 15: Performance Reviews
            it('should assess performance requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Performance Team: Reviewing iot_expert's platform metrics.
                    Testing: Latency is within limits.
                    Infrastructure: Load testing looks good.
                    Monitoring: Clear performance SLAs.
                    Security: No performance impact from encryption.
                    Lead: Performance requirements are met?
                    Team: Yes, all metrics are green.
                    Lead: Excellent, performance approved for IoT project.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(iotOpp?.relevantSection).toMatch(/platform metrics[\s\S]*performance approved/)
            }, 30000)

            // Group 16: Maintenance Reviews
            it('should evaluate maintenance requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Ops: Maintenance review for ai_researcher's systems.
                    DevOps: Automated monitoring possible.
                    SRE: Failover is straightforward.
                    Support: Self-healing capabilities built in.
                    Ops: Maintenance overhead acceptable?
                    Team: Yes, within our SLAs.
                    Ops: Good, maintenance plan approved for AI collaboration.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(aiOpp?.relevantSection).toMatch(/Maintenance review[\s\S]*plan approved/)
            }, 30000)

            // Group 17: Training Reviews
            it('should assess training requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Training: Let's review crypto_dev's blockchain training needs.
                    HR: Team needs extensive training.
                    Engineering: Learning curve is steep.
                    Support: Customer training complex too.
                    Training: This is a major undertaking.
                    PM: Timeline impact?
                    Training: 3-4 months minimum.
                    PM: That's too long, let's pass on the blockchain proposal.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(blockchainOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(blockchainOpp?.relevantSection).toMatch(/training needs[\s\S]*let's pass/)
            }, 30000)

            // Group 18: Compliance Reviews
            it('should handle compliance requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Compliance: IoT project compliance review with iot_expert.
                    Legal: Meets regulatory requirements.
                    Security: Privacy standards satisfied.
                    Data: GDPR compliance confirmed.
                    Compliance: Any outstanding items?
                    Team: All compliance checks passed.
                    Compliance: Full compliance approval given.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(iotOpp?.relevantSection).toMatch(/compliance review[\s\S]*approval given/)
            }, 30000)

            // Group 19: User Experience Reviews
            it('should evaluate UX implications', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    UX Lead: Reviewing ai_researcher's interface design.
                    Design: Clean, intuitive interface.
                    Research: User testing very positive.
                    Accessibility: WCAG compliant.
                    UX Lead: Any usability concerns for AI collaboration?
                    Team: None identified.
                    UX Lead: Full UX approval then.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(aiOpp?.relevantSection).toMatch(/interface design[\s\S]*UX approval/)
            }, 30000)

            // Group 20: Data Management Reviews
            it('should assess data handling requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Data Officer: Reviewing crypto_dev's blockchain data handling.
                    Security: Data encryption insufficient.
                    Privacy: PII handling concerns.
                    Compliance: Data retention issues.
                    Data Officer: These are serious problems.
                    Legal: Too much liability risk.
                    Data Officer: Cannot approve blockchain integration.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(blockchainOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(blockchainOpp?.relevantSection).toMatch(/data handling[\s\S]*Cannot approve/)
            }, 30000)

            // Group 21: Quality Assurance Reviews
            it('should evaluate QA requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    QA Lead: Testing assessment for iot_expert's platform.
                    Testing: Automation coverage good.
                    Security: Penetration testing passed.
                    Performance: Load testing successful.
                    QA Lead: Testing timeline realistic for IoT project?
                    Team: Yes, fits release schedule.
                    QA Lead: QA plan approved.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(iotOpp?.relevantSection).toMatch(/Testing assessment[\s\S]*QA plan approved/)
            }, 30000)

            // Group 22: Partnership Strategy Reviews
            it('should assess strategic partnership value', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Strategy: Strategic review of ai_researcher partnership.
                    Business: Strong market synergy.
                    Sales: Opens new verticals.
                    Marketing: Brand alignment perfect.
                    Strategy: Long-term potential for AI collaboration?
                    Team: Very promising roadmap.
                    Strategy: This is a strategic priority.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(aiOpp?.relevantSection).toMatch(/Strategic review[\s\S]*strategic priority/)
            }, 30000)

            // Group 23: Support Impact Reviews
            it('should evaluate support requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Support Lead: Impact analysis of crypto_dev's blockchain integration.
                    L1: Beyond our expertise.
                    L2: Training gap is significant.
                    L3: Complex troubleshooting needed.
                    Support Lead: Can we handle this?
                    Team: Not with current resources.
                    Support Lead: This is a support blocker.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const blockchainOpp = result.identifiedOpportunities.find(o => o.id === 'opp2')
                expect(blockchainOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(blockchainOpp?.relevantSection).toMatch(/Impact analysis[\s\S]*support blocker/)
            }, 30000)

            // Group 24: Infrastructure Reviews
            it('should assess infrastructure requirements', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Infrastructure: Reviewing iot_expert's platform requirements.
                    Cloud: AWS resources sufficient.
                    Network: Bandwidth requirements met.
                    Storage: Capacity planning done.
                    Infrastructure: Any scaling issues for IoT project?
                    Team: All within our limits.
                    Infrastructure: Infrastructure approved.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const iotOpp = result.identifiedOpportunities.find(o => o.id === 'opp3')
                expect(iotOpp?.confidence).toBeGreaterThanOrEqual(0.8)
                expect(iotOpp?.relevantSection).toMatch(/platform requirements[\s\S]*Infrastructure approved/)
            }, 30000)

            // Group 25: Market Timing Reviews
            it('should evaluate market timing', async () => {
                const input = {
                    opportunities,
                    transcript: `
                    Market Research: Timing review for ai_researcher collaboration.
                    Analysis: Market is primed for this.
                    Competition: Limited AI solutions exist.
                    Demand: Strong customer interest.
                    Market Research: Time to move on this opportunity?
                    Team: Perfect market conditions.
                    Market Research: Full speed ahead with AI partnership.
                  `,
                    modelConfig
                }

                const result = await analyzeBulkTranscript(input)

                expect(result.metadata.modelName).toBe(modelConfig.modelName)
                expect(result.metadata.temperature).toBe(modelConfig.temperature)
                const aiOpp = result.identifiedOpportunities.find(o => o.id === 'opp1')
                expect(aiOpp?.confidence).toBeGreaterThanOrEqual(0.9)
                expect(aiOpp?.relevantSection).toMatch(/Timing review[\s\S]*Full speed ahead/)
            }, 30000)
        })
    })

    // Keep the default model config test outside the loop
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

        // Verify default metadata
        expect(result.metadata).toBeDefined()
        expect(result.metadata.modelName).toBe("gpt-4")
        expect(result.metadata.temperature).toBe(0)
        expect(result.metadata.maxTokens).toBeUndefined()
        expect(result.metadata.processingTimeMs).toBeGreaterThan(0)
        expect(result.metadata.totalTokens).toBeGreaterThan(0)

        // Verify opportunities still work
        expect(result.identifiedOpportunities).toHaveLength(1)
        expect(result.identifiedOpportunities[0].id).toBe('opp1')
    }, 30000)
}) 