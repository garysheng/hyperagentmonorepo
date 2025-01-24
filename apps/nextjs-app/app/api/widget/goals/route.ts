import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const celebrityId = searchParams.get('celebrityId')

    if (!celebrityId) {
      return NextResponse.json(
        { error: 'Celebrity ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching goals for celebrity:', celebrityId)

    const supabase = await createClient()

    const { data: rawGoals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('celebrity_id', celebrityId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
      return NextResponse.json(
        { error: 'Failed to fetch goals' },
        { status: 500 }
      )
    }

    // Map the goals to the expected format
    const goals = rawGoals.map(goal => ({
      title: goal.name || 'Untitled Goal',
      description: goal.description || ''
    }))

    console.log('Found goals:', goals)

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 