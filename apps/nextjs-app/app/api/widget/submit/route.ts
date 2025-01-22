import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createOpportunity } from '@/lib/opportunities'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { celebrity_id, name, email, phone, message } = await request.json()

    if (!celebrity_id) {
      return NextResponse.json(
        { error: 'Missing celebrity_id' },
        { status: 400 }
      )
    }

    // Check if celebrity exists
    const { data: celebrity, error: celebrityError } = await supabase
      .from('celebrities')
      .select('id')
      .eq('id', celebrity_id)
      .single()

    if (celebrityError || !celebrity) {
      return NextResponse.json(
        { error: 'Invalid celebrity_id' },
        { status: 400 }
      )
    }

    // Create opportunity
    const opportunity = await createOpportunity(supabase, {
      celebrity_id,
      source: 'WIDGET',
      initial_content: message,
      name,
      email,
      phone,
      // Generate a unique sender ID and handle for widget submissions
      sender_id: `widget_${Date.now()}`,
      sender_handle: name || 'Anonymous Widget User'
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