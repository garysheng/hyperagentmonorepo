import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TableName } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const opportunityId = searchParams.get('opportunityId')

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First get the email thread for this opportunity
    const { data: thread, error: threadError } = await supabase
      .from(TableName.EMAIL_THREADS)
      .select('id, subject')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (threadError) {
      console.error('Error fetching thread:', threadError)
      return NextResponse.json(
        { error: 'Failed to fetch thread' },
        { status: 500 }
      )
    }

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      )
    }

    // Then get all messages for this thread
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