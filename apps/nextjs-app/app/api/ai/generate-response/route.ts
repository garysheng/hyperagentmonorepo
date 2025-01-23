import { NextResponse } from 'next/server';
import { responseGenerator } from '@/lib/ai/response-generator';
import { createClient } from '@/lib/supabase/server';
import { TableName } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const {
      messageType,
      content,
      celebrityId,
      threadId
    } = await req.json();

    // Validate required fields
    if (!messageType || !content || !celebrityId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get previous messages if threadId is provided
    let previousMessages: Message[] = [];
    if (threadId) {
      const supabase = await createClient();
      const { data: messages } = await supabase
        .from(messageType === 'email' ? TableName.EMAIL_MESSAGES : TableName.OPPORTUNITY_MESSAGES)
        .select('content, direction')
        .eq(messageType === 'email' ? 'thread_id' : 'opportunity_id', threadId)
        .order('created_at', { ascending: true })
        .limit(5);

      if (messages) {
        previousMessages = messages.map(msg => ({
          role: msg.direction === 'inbound' ? 'user' : 'assistant',
          content: msg.content
        }));
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
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 