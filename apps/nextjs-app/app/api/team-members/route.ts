import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    const { data: user, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: teamMembers, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('full_name')

    if (error) {
      console.error('Error fetching team members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error('Error in team members API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 