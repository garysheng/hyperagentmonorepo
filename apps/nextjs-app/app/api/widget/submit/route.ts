import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createOpportunity } from '@/lib/opportunities'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const { email, message, celebrityId } = await req.json()

    // Validate input
    if (!email || !message || !celebrityId) {
      return NextResponse.json(
        { error: 'Email, message, and celebrityId are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if celebrity exists
    const { data: celebrity, error: celebrityError } = await supabase
      .from('celebrities')
      .select('id')
      .eq('id', celebrityId)
      .single()

    if (celebrityError || !celebrity) {
      console.error('Invalid celebrityId:', celebrityId, 'Error:', celebrityError)
      return NextResponse.json(
        { error: 'Invalid celebrityId' },
        { status: 400 }
      )
    }

    // Create opportunity
    const opportunity = await createOpportunity(supabase, {
      celebrity_id: celebrityId,
      source: 'WIDGET',
      initial_content: message,
      sender_id: randomUUID(),
      sender_handle: email
    })

    return NextResponse.json({
      success: true,
      message: 'Message received successfully',
      opportunity
    })
  } catch (error) {
    console.error('Error processing widget submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 