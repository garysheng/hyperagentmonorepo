import { NextRequest, NextResponse } from 'next/server';
import { responseGenerator } from '@/lib/ai/response-generator';
import { createClient } from '@/lib/supabase/server';
import { TableName } from '@/types';
import { z } from 'zod';

const generateResponseSchema = z.object({
  messageType: z.enum(['email', 'tweet']),
  content: z.string(),
  celebrityId: z.string(),
  threadId: z.string().optional(),
  previousMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DatabaseMessage {
  content: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = generateResponseSchema.parse(body);
    const { messageType, content, celebrityId, threadId, previousMessages: existingMessages } = validatedData;

    // Get previous messages if threadId is provided
    let previousMessages: Message[] = existingMessages || [];
    if (threadId) {
      const supabase = await createClient();
      const { data: messages, error } = await supabase
        .from(messageType === 'email' ? TableName.EMAIL_MESSAGES : TableName.OPPORTUNITY_MESSAGES)
        .select('content, direction, created_at')
        .eq(messageType === 'email' ? 'thread_id' : 'opportunity_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching thread messages:', error);
        return NextResponse.json(
          { error: 'Failed to fetch conversation history' },
          { status: 500 }
        );
      }

      if (messages && messages.length > 0) {
        // Convert database messages to the format expected by the AI
        const threadMessages = (messages as DatabaseMessage[]).map(msg => ({
          role: msg.direction === 'inbound' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

        // Combine thread messages with any existing messages
        // Thread messages come first to maintain chronological order
        previousMessages = [...threadMessages, ...previousMessages];

        // Limit to last 10 messages to keep context manageable
        if (previousMessages.length > 10) {
          previousMessages = previousMessages.slice(-10);
        }

        console.log('Using conversation history:', {
          threadId,
          messageCount: previousMessages.length,
          lastMessage: previousMessages[previousMessages.length - 1]
        });
      }
    }

    // Generate response with conversation history
    const response = await responseGenerator.generateResponse({
      messageType,
      content,
      celebrityId,
      previousMessages
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error generating response:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
} 