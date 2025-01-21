import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { v5 as uuidv5 } from 'uuid'

// Generate a deterministic UUID based on email
function generateUserUUID(email: string): string {
  // Create a UUID v5 using email as the name
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  return uuidv5(email, NAMESPACE)
}

export async function POST(request: Request) {
  try {
    const { celebrityId, email, message } = await request.json()

    if (!celebrityId || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = await createServerClient()

    // Create opportunity
    const { data: opportunity, error: opportunityError } = await supabase
      .from('opportunities')
      .insert({
        celebrity_id: celebrityId,
        sender_id: generateUserUUID(email),
        sender_handle: email,
        initial_content: message,
        status: 'pending',
        relevance_score: 1,
        needs_discussion: false
      })
      .select()
      .single()

    if (opportunityError) {
      console.error('Error creating opportunity:', opportunityError)
      return NextResponse.json(
        { error: 'Failed to create opportunity' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, opportunityId: opportunity.id })
  } catch (error) {
    console.error('Error handling widget submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 