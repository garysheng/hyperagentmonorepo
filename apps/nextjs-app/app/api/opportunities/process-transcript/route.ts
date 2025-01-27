import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processTranscript } from './process'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get request body
    const { opportunityId, transcript } = await request.json()
    if (!opportunityId || !transcript) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the opportunity to provide context
    const { data: opportunity } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single()

    if (!opportunity) {
      return new NextResponse('Opportunity not found', { status: 404 })
    }

    // Process transcript with extracted function
    const result = await processTranscript({
      currentStatus: opportunity.status,
      initialMessage: opportunity.initial_content,
      transcript
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing transcript:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 