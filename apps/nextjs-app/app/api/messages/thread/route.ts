import { createClient } from '@/lib/supabase/server'
import { TableName } from '@/types'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get('opportunityId')

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'opportunityId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the most recent email thread
    const { data: threads, error: threadError } = await supabase
      .from(TableName.EMAIL_THREADS)
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (threadError) {
      console.error('Error fetching thread:', threadError)
      return NextResponse.json(
        { error: 'Failed to fetch thread' },
        { status: 500 }
      )
    }

    if (!threads || threads.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      )
    }

    const thread = threads[0]

    // Get all messages for this thread
    const { data: messages, error: messagesError } = await supabase
      .from(TableName.EMAIL_MESSAGES)
      .select('*')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      thread,
      messages: messages || []
    })
  } catch (error) {
    console.error('Error in thread route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 