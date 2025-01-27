import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get request body
    const { 
      opportunityId, 
      transcript, 
      proposedStatus, 
      summary, 
      actionRecap 
    } = await request.json()

    if (!opportunityId || !transcript || !proposedStatus || !summary || !actionRecap) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Update the opportunity with the transcript data
    const { error: updateError } = await supabase
      .from('opportunities')
      .update({
        status: proposedStatus,
        meeting_note_transcript: transcript,
        meeting_note_summary: summary,
        meeting_note_action_recap: actionRecap,
        meeting_note_processed_at: new Date().toISOString(),
        meeting_note_processed_by: user.id,
        needs_discussion: false // Since we've processed the discussion
      })
      .eq('id', opportunityId)

    if (updateError) {
      console.error('Error updating opportunity:', updateError)
      return new NextResponse('Failed to update opportunity', { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error applying transcript:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 