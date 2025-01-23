import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createOpportunity } from '@/lib/opportunities'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    console.log('Widget submit request body:', body)
    
    const { celebrityId, email, message } = body

    if (!celebrityId) {
      console.log('Missing celebrityId in request')
      return NextResponse.json(
        { error: 'Missing celebrityId' },
        { status: 400 }
      )
    }

    // Check if celebrity exists
    const { data: celebrity, error: celebrityError } = await supabase
      .from('celebrities')
      .select('id')
      .eq('id', celebrityId)
      .single()

    if (celebrityError || !celebrity) {
      console.log('Invalid celebrityId:', celebrityId, 'Error:', celebrityError)
      return NextResponse.json(
        { error: 'Invalid celebrityId' },
        { status: 400 }
      )
    }

    // Create opportunity using the proper function
    const opportunity = await createOpportunity(supabase, {
      celebrity_id: celebrityId,
      source: 'WIDGET',
      initial_content: message,
      sender_id: randomUUID(),
      sender_handle: email || 'Anonymous Widget User'
    })

    return NextResponse.json({ success: true, opportunity })
  } catch (error) {
    console.error('Error in widget submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 