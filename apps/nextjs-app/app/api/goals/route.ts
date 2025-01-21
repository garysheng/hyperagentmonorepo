import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's celebrity_id first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('celebrity_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('Failed to fetch user data')
    }

    // Then get the goals for that celebrity
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select()
      .eq('celebrity_id', userData.celebrity_id)
      .order('priority', { ascending: true })

    if (goalsError) throw goalsError

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 