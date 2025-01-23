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
      const { data: messages } = await supabase
        .from(messageType === 'email' ? TableName.EMAIL_MESSAGES : TableName.OPPORTUNITY_MESSAGES)
        .select('content, direction')
        .eq(messageType === 'email' ? 'thread_id' : 'opportunity_id', threadId)
        .order('created_at', { ascending: true })
        .limit(5);

      if (messages) {
        // If we have both thread messages and existing messages, combine them
        const threadMessages = (messages as DatabaseMessage[]).map(msg => ({
          role: msg.direction === 'inbound' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));
        previousMessages = [...threadMessages, ...previousMessages];
      }
    }

    // Generate response
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
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 