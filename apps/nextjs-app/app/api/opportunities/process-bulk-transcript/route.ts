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
      .select('id, initial_content, status, sender_handle')
      .in('status', ['pending', 'approved'])

    if (!opportunities) {
      return new NextResponse('No opportunities found', { status: 404 })
    }

    // Analyze transcript
    const result = await analyzeBulkTranscript({
      transcript,
      opportunities
    })

    // Merge the identified opportunities with original data and add confidence
    const enrichedOpportunities = result.identifiedOpportunities.map(identified => {
      const original = opportunities.find(o => o.id === identified.id)
      if (!original) {
        console.warn(`Could not find original opportunity for id: ${identified.id}`)
        return null
      }
      return {
        ...identified,
        ...original,
        confidence: 0.8 // Default high confidence since it's an exact match
      }
    }).filter(Boolean) // Remove any null values

    return NextResponse.json({
      opportunities: enrichedOpportunities,
      metadata: result.metadata
    })
  } catch (error) {
    console.error('Error processing bulk transcript:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 