import { AI_MODELS, AI_DEFAULTS } from './constants';

interface ClassificationResult {
  relevanceScore: number;
  tags: string[];
  status: 'pending' | 'rejected';
  needsDiscussion: boolean;
  goalId?: string;
  explanation: string;
  senderBio: string;
}

interface ClassifyOpportunityParams {
  content: string;
  goals: { id: string; name: string; description: string | null }[];
  email?: string;
  twitterUsername?: string;
}

export class PerplexityAI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async classifyOpportunity({
    content,
    goals,
    email,
    twitterUsername
  }: ClassifyOpportunityParams): Promise<ClassificationResult> {
    const goalsText = goals.map(g => 
      `- ${g.name}${g.description ? `: ${g.description}` : ''} (ID: ${g.id})`
    ).join('\n');

    const senderInfo = [
      email && `Email: ${email}`,
      twitterUsername && `Twitter Username: ${twitterUsername}`
    ].filter(Boolean).join('\n');

    const prompt = `
      Given the following message, sender information, and list of goals, analyze both the message and the sender to provide a classification in JSON format.
      
      Goals:
      ${goalsText}

      ${senderInfo ? `\nSender Information:\n${senderInfo}\n` : ''}

      Message: "${content}"

      If an email address is provided, analyze it carefully to determine:
      - If it's a company email, what company they work for and their potential role
      - If it's a personal email, what it might suggest about their identity
      - Look for any professional indicators in the email format (e.g., firstname.lastname@company.com suggests a corporate role)
      - Check the email domain for insights about their affiliation

      Provide a JSON object with the following fields:
      - relevanceScore: number from 0-5 indicating how relevant this opportunity is (0 being completely irrelevant, 5 being highly relevant)
      - tags: array of strings describing the key topics or themes
      - status: either "pending" or "rejected" (use "pending" if relevanceScore >= 2, otherwise "rejected")
      - needsDiscussion: boolean indicating if this needs team discussion
      - goalId: string ID of the most relevant goal from the list above, or null if none are relevant
      - explanation: a detailed explanation (2-3 sentences) of why you assigned these ratings and classifications, specifically mentioning how the message relates to any matched goal
      - senderBio: a 2-3 sentence overview of the sender that includes:
        * Their likely role and company/organization based on email analysis (if email provided)
        * Their estimated social media presence and influence, particularly on Twitter/X if available
        * How their background and reach aligns with or could help achieve the celebrity's goals
        * Any red flags or notable positive indicators about their authenticity

      Consider the goals when determining relevance and status. If the message aligns well with any goal, it should have a higher relevance score.
      Remember: Only use "pending" or "rejected" for status - never use "approved".
      Use 0 for relevanceScore if the message is completely irrelevant or spam.

      Respond only with the JSON object, no other text.
    `.trim();

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: AI_MODELS.PERPLEXITY_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that analyzes messages in the context of business goals and provides detailed classifications in JSON format. Your explanations should be clear and specific, highlighting key factors in your decision-making process. Use relevance scores from 0-5, with 0 for completely irrelevant messages. Always use "pending" for potentially relevant opportunities (score >= 2) and "rejected" for irrelevant ones (score < 2).'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: AI_DEFAULTS.TEMPERATURE,
          max_tokens: AI_DEFAULTS.MAX_TOKENS
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Perplexity API error: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
      }

      const data = await response.json();
      let result: ClassificationResult;

      try {
        const jsonStr = data.choices[0].message.content;
        result = JSON.parse(jsonStr);
      } catch (error) {
        console.error('Failed to parse API response:', data, 'Error:', error);
        throw new Error('Invalid response format from Perplexity API');
      }

      // Validate the result
      if (
        typeof result.relevanceScore !== 'number' ||
        result.relevanceScore < 0 ||
        result.relevanceScore > 5 ||
        !Array.isArray(result.tags) ||
        !['pending', 'rejected'].includes(result.status) ||
        typeof result.needsDiscussion !== 'boolean' ||
        typeof result.explanation !== 'string' ||
        result.explanation.length < 10 ||
        typeof result.senderBio !== 'string' ||
        result.senderBio.length < 10
      ) {
        console.error('Invalid result structure:', result);
        throw new Error('Invalid classification result from Perplexity');
      }

      // Validate goalId if present
      if (result.goalId && !goals.some(g => g.id === result.goalId)) {
        console.error('Invalid goalId in result:', result);
        result.goalId = undefined;
      }

      // Force status based on relevance score
      result.status = result.relevanceScore >= 2 ? 'pending' : 'rejected';

      return result;
    } catch (error) {
      console.error('Perplexity API error:', error);
      throw error;
    }
  }
} 