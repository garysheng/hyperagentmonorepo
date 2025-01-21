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

    // Get the user's data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('Failed to fetch user data')
    }

    // Get all goals if admin, otherwise return empty array
    // In a real app, you might want to implement more specific access control
    if (userData.role !== 'admin') {
      return NextResponse.json([])
    }

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select(`
        id,
        celebrity_id,
        name,
        description,
        priority,
        created_at,
        celebrities (
          id,
          celebrity_name
        )
      `)
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