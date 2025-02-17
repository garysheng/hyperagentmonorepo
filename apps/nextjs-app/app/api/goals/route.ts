import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

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
      .select('id, role, celebrity_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // If no user data found, return empty goals
    if (!userData || !userData.celebrity_id) {
      return NextResponse.json([])
    }

    // Get goals based on role and celebrity_id
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select(`
        id,
        celebrity_id,
        name,
        description,
        priority,
        default_user_id,
        created_at
      `)
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const goal = await request.json()

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

    // Get the user's celebrity_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('celebrity_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.celebrity_id) {
      return NextResponse.json(
        { error: 'User not associated with a celebrity' },
        { status: 403 }
      )
    }

    // Ensure the goal is created for the user's celebrity
    const goalWithCelebrity = {
      ...goal,
      celebrity_id: userData.celebrity_id
    }

    const { data, error } = await supabase
      .from('goals')
      .insert([goalWithCelebrity])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const goal = await request.json()

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

    const { data, error } = await supabase
      .from('goals')
      .update(goal)
      .eq('id', goal.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { id } = await request.json()

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

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 