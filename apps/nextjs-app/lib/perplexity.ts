interface ClassificationResult {
  relevanceScore: number;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  needsDiscussion: boolean;
  goalId?: string;
}

export class PerplexityAI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async classifyOpportunity(content: string, goals: { id: string; name: string; description: string | null }[]): Promise<ClassificationResult> {
    const goalsText = goals.map(g => 
      `- ${g.name}${g.description ? `: ${g.description}` : ''} (ID: ${g.id})`
    ).join('\n');

    const prompt = `
      Given the following message and list of goals, analyze the message and provide a classification in JSON format.
      
      Goals:
      ${goalsText}

      Message: "${content}"

      Provide a JSON object with the following fields:
      - relevanceScore: number from 1-5 indicating how relevant this opportunity is (1 being least relevant, 5 being most relevant)
      - tags: array of strings describing the key topics or themes
      - status: either "pending", "approved", or "rejected"
      - needsDiscussion: boolean indicating if this needs team discussion
      - goalId: string ID of the most relevant goal from the list above, or null if none are relevant

      Consider the goals when determining relevance and status. If the message aligns well with any goal, it should have a higher relevance score.
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
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that analyzes messages in the context of business goals and provides classifications in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 300
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
      } catch (e) {
        console.error('Failed to parse API response:', data);
        throw new Error('Invalid response format from Perplexity API');
      }

      // Validate the result
      if (
        typeof result.relevanceScore !== 'number' ||
        !Array.isArray(result.tags) ||
        !['pending', 'approved', 'rejected'].includes(result.status) ||
        typeof result.needsDiscussion !== 'boolean'
      ) {
        console.error('Invalid result structure:', result);
        throw new Error('Invalid classification result from Perplexity');
      }

      // Validate goalId if present
      if (result.goalId && !goals.some(g => g.id === result.goalId)) {
        console.error('Invalid goalId in result:', result);
        result.goalId = undefined;
      }

      return result;
    } catch (error) {
      console.error('Perplexity API error:', error);
      throw error;
    }
  }
} 