import { createClient } from '@/lib/supabase/server';
import { TableName, WritingStyle } from '@/types';

interface GenerateResponseOptions {
  messageType: 'email' | 'tweet';
  content: string;
  celebrityId: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  goals?: Array<{
    name: string;
    description: string;
  }>;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class ResponseGenerator {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY!;
    if (!apiKey) {
      throw new Error('Deepseek API key is required');
    }
    this.apiKey = apiKey;
  }

  private async getCelebrityContext(celebrityId: string) {
    const supabase = await createClient();

    // Get celebrity details
    const { data: celebrity, error: celebrityError } = await supabase
      .from(TableName.CELEBRITIES)
      .select('celebrity_name')
      .eq('id', celebrityId)
      .single();

    if (celebrityError) {
      throw new Error(`Failed to fetch celebrity details: ${celebrityError.message}`);
    }

    // Get celebrity's goals
    const { data: goals, error: goalsError } = await supabase
      .from(TableName.GOALS)
      .select('name, description')
      .eq('celebrity_id', celebrityId)
      .order('priority', { ascending: true });

    if (goalsError) {
      throw new Error(`Failed to fetch celebrity goals: ${goalsError.message}`);
    }

    // Get writing style
    const { data: writingStyle, error: styleError } = await supabase
      .from(TableName.WRITING_STYLES)
      .select('*')
      .eq('celebrity_id', celebrityId)
      .single();

    if (styleError && styleError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch writing style: ${styleError.message}`);
    }

    return {
      celebrityName: celebrity?.celebrity_name,
      goals: goals || [],
      writingStyle
    };
  }

  private buildMessages({
    messageType,
    content,
    celebrityName,
    goals = [],
    previousMessages = [],
    writingStyle
  }: Omit<GenerateResponseOptions, 'celebrityId'> & { celebrityName: string, writingStyle?: WritingStyle }): Message[] {
    const messageContext = messageType === 'email' 
      ? 'This is an email conversation'
      : 'This is a Twitter DM conversation';

    const goalsContext = goals.length > 0
      ? `\nThe celebrity's goals are:\n${goals.map(g => `- ${g.name}: ${g.description}`).join('\n')}`
      : '\nThe celebrity has no specific goals set.';

    // Build conversation summary from previous messages
    const conversationSummary = previousMessages.length > 0
      ? `\nConversation context:\n${previousMessages.map(msg => {
          const topics = msg.content.match(/AI|machine learning|blockchain|tech|conference|event/gi);
          return topics ? `- Discussed: ${topics.join(', ')}` : '';
        }).filter(Boolean).join('\n')}`
      : '';

    // Build writing style context
    let writingStyleContext = '';
    if (writingStyle) {
      writingStyleContext = `
Writing Style Guidelines:
1. Formality: ${writingStyle.formality_level}/100 (higher means more formal)
2. Enthusiasm: ${writingStyle.enthusiasm_level}/100 (higher means more enthusiastic)
3. Directness: ${writingStyle.directness_level}/100 (higher means more direct)
4. Humor: ${writingStyle.humor_level}/100 (higher means more humorous)
5. Sentence Length: ${writingStyle.sentence_length_preference}/100 (higher means longer sentences)
6. Vocabulary: ${writingStyle.vocabulary_complexity}/100 (higher means more complex vocabulary)
7. Technical Language: ${writingStyle.technical_language_level}/100 (higher means more technical)
8. Emoji Usage: ${writingStyle.emoji_usage_level}/100 (higher means more emojis)

${writingStyle.preferred_phrases.length > 0 ? `Preferred Phrases:\n${writingStyle.preferred_phrases.map(p => `- "${p}"`).join('\n')}\n` : ''}
${writingStyle.avoided_phrases.length > 0 ? `Phrases to Avoid:\n${writingStyle.avoided_phrases.map(p => `- "${p}"`).join('\n')}\n` : ''}
${writingStyle.preferred_greetings.length > 0 ? `Preferred Greetings:\n${writingStyle.preferred_greetings.map(p => `- "${p}"`).join('\n')}\n` : ''}
${writingStyle.preferred_signoffs.length > 0 ? `Preferred Sign-offs:\n${writingStyle.preferred_signoffs.map(p => `- "${p}"`).join('\n')}\n` : ''}

${writingStyle.voice_examples.length > 0 ? `Voice Examples:\n${writingStyle.voice_examples.map(ex => `Context: ${ex.context}\nExample: "${ex.content}"`).join('\n\n')}\n` : ''}`;
    }

    const systemPrompt = `You are an AI assistant helping ${celebrityName}'s team respond to messages.
${messageContext}.
${goalsContext}
${conversationSummary}
${writingStyleContext}

Your responses should:
1. Align with the celebrity's goals if applicable
2. Maintain a consistent tone appropriate for ${messageType === 'email' ? 'email' : 'Twitter DM'}
3. Be concise and clear
4. Reference and acknowledge relevant topics from previous messages in the conversation
5. Encourage further constructive dialogue if appropriate
6. Strictly follow the writing style guidelines provided

IMPORTANT: Always maintain context from previous messages in your responses, especially when discussing topics like industry focus, event themes, or areas of expertise. When quoting fees or discussing logistics, relate them back to the specific context of the event or project.

Remember to stay professional while being friendly and engaging.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add previous messages
    previousMessages.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: 'user', content });

    return messages;
  }

  async generateResponse(options: GenerateResponseOptions): Promise<string> {
    const { celebrityName, goals, writingStyle } = await this.getCelebrityContext(options.celebrityId);
    
    if (!celebrityName) {
      throw new Error('Celebrity not found');
    }

    const messages = this.buildMessages({
      ...options,
      celebrityName,
      goals,
      writingStyle
    });

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Deepseek API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw new Error('Failed to generate response');
    }
  }
}

export const responseGenerator = new ResponseGenerator();