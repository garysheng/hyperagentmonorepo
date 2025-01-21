interface ClassificationResult {
  relevanceScore: number;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  needsDiscussion: boolean;
}

export class PerplexityAI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async classifyOpportunity(content: string): Promise<ClassificationResult> {
    const prompt = `
      Given the following message, analyze it and provide a classification in JSON format with the following fields:
      - relevanceScore: number from 1-5 indicating how relevant this opportunity is (1 being least relevant, 5 being most relevant)
      - tags: array of strings describing the key topics or themes
      - status: either "pending", "approved", or "rejected"
      - needsDiscussion: boolean indicating if this needs team discussion

      Message: "${content}"

      Respond only with the JSON object, no other text.
    `;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Validate the result
    if (
      typeof result.relevanceScore !== 'number' ||
      !Array.isArray(result.tags) ||
      !['pending', 'approved', 'rejected'].includes(result.status) ||
      typeof result.needsDiscussion !== 'boolean'
    ) {
      throw new Error('Invalid classification result from Perplexity');
    }

    return result;
  }
} 