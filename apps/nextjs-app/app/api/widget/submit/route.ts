import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createOpportunity } from '@/lib/opportunities'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { celebrity_id, name, email, phone, message } = body

    if (!celebrity_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify celebrity exists
    const { data: celebrity, error: celebrityError } = await supabase
      .from('celebrities')
      .select('id')
      .eq('id', celebrity_id)
      .single()

    if (celebrityError || !celebrity) {
      return NextResponse.json(
        { error: 'Celebrity not found' },
        { status: 404 }
      )
    }

    // Create opportunity
    try {
      const opportunity = await createOpportunity(supabase, {
        celebrity_id,
        source: 'WIDGET',
        description: message,
        name,
        email,
        phone
      })

      return NextResponse.json({ success: true, opportunity })
    } catch (error) {
      console.error('Error creating opportunity:', error)
      return NextResponse.json(
        { error: 'Failed to create opportunity' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in widget submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 