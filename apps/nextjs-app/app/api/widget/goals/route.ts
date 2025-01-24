import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    // Get celebrityId from query params
    const { searchParams } = new URL(req.url)
    const celebrityId = searchParams.get('celebrityId')

    console.log('Fetching goals for celebrity:', celebrityId)

    if (!celebrityId) {
      console.error('Missing celebrityId in request')
      return NextResponse.json(
        { error: 'Celebrity ID is required' },
        { status: 400 }
      )
    }

    console.log('Creating Supabase client...')
    let supabase
    try {
      supabase = await createClient()
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      return NextResponse.json(
        { error: 'Database connection error', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
    console.log('Supabase client created successfully')

    // First check if celebrity exists
    console.log('Checking if celebrity exists...')
    const { data: celebrity, error: celebrityError } = await supabase
      .from('celebrities')
      .select('id')
      .eq('id', celebrityId)
      .single()

    if (celebrityError) {
      console.error('Error checking celebrity:', celebrityError)
      return NextResponse.json(
        { error: 'Failed to check celebrity', details: celebrityError.message },
        { status: 500 }
      )
    }

    if (!celebrity) {
      console.error('Celebrity not found:', celebrityId)
      return NextResponse.json(
        { error: 'Celebrity not found' },
        { status: 404 }
      )
    }

    console.log('Found celebrity:', celebrity.id)

    // Fetch goals for the celebrity
    console.log('Fetching goals...')
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('id, name, description, priority, created_at')
      .eq('celebrity_id', celebrityId)
      .order('created_at', { ascending: false })

    if (goalsError) {
      console.error('Error fetching goals:', goalsError)
      return NextResponse.json(
        { error: 'Failed to fetch goals', details: goalsError.message },
        { status: 500 }
      )
    }

    console.log('Found goals:', goals?.length || 0)

    return NextResponse.json({
      success: true,
      goals: goals?.map(goal => ({
        id: goal.id,
        title: goal.name,
        description: goal.description,
        priority: goal.priority,
        created_at: goal.created_at
      })) || []
    })
  } catch (error) {
    console.error('Error in goals endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 