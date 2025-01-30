import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    console.log('Starting apply-transcript process...')
    const supabase = await createClient()

    // Get request body
    const body = await request.json()
    const { 
      opportunityId, 
      transcript, 
      proposedStatus, 
      summary, 
      actionRecap 
    } = body

    console.log('Received request body:', {
      opportunityId,
      transcript: transcript?.substring(0, 100) + '...',
      proposedStatus,
      summary: summary?.substring(0, 100) + '...',
      actionRecap: actionRecap?.substring(0, 100) + '...'
    })

    if (!opportunityId || !transcript || !proposedStatus || !summary || !actionRecap) {
      console.error('Missing required fields:', {
        hasOpportunityId: !!opportunityId,
        hasTranscript: !!transcript,
        hasProposedStatus: !!proposedStatus,
        hasSummary: !!summary,
        hasActionRecap: !!actionRecap
      })
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check authentication
    const authResponse = await supabase.auth.getUser()
    console.log('Auth response:', {
      hasUser: !!authResponse.data.user,
      error: authResponse.error
    })

    const { data: { user } } = authResponse
    if (!user) {
      console.error('Authentication failed - no user found')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('Attempting to update opportunity:', opportunityId)
    
    // Update the opportunity with the transcript data
    const updateResponse = await supabase
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
      .select()

    console.log('Update response:', {
      data: updateResponse.data,
      error: updateResponse.error,
      status: updateResponse.status
    })

    if (updateResponse.error) {
      console.error('Error updating opportunity:', {
        error: updateResponse.error,
        status: updateResponse.status,
        statusText: updateResponse.statusText
      })
      return new NextResponse(`Failed to update opportunity: ${updateResponse.error.message}`, { status: 500 })
    }

    console.log('Successfully updated opportunity')
    return NextResponse.json({ 
      success: true,
      data: updateResponse.data
    })
  } catch (error) {
    console.error('Error in apply-transcript:', error)
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }
} 