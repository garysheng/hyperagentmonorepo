import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: celebrities, error } = await supabase
      .from('celebrities')
      .select('id, celebrity_name')
      .order('celebrity_name')

    if (error) {
      console.error('Error fetching celebrities:', error)
      return NextResponse.json(
        { error: 'Failed to fetch celebrities' },
        { status: 500 }
      )
    }

    return NextResponse.json(celebrities)
  } catch (error) {
    console.error('Error in celebrities API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 