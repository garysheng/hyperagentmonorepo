import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeBulkTranscript } from './process'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get request body
    const { transcript } = await request.json()
    if (!transcript) {
      return new NextResponse('Missing transcript', { status: 400 })
    }

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get all pending opportunities to check against
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('id, initial_content, status')
      .in('status', ['pending', 'approved'])

    if (!opportunities) {
      return new NextResponse('No opportunities found', { status: 404 })
    }

    // Analyze transcript
    const result = await analyzeBulkTranscript({
      transcript,
      opportunities
    })

    // Filter out low confidence matches
    const validOpportunities = result.identifiedOpportunities.filter(
      opp => opp.confidence >= 0.7
    )

    return NextResponse.json({
      opportunities: validOpportunities
    })
  } catch (error) {
    console.error('Error processing bulk transcript:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 