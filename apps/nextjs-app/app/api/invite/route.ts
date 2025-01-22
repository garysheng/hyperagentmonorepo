import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { role } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
      error: authError
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
      .select('celebrity_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Create invite code
    const { data, error } = await supabase
      .rpc('create_invite_code', {
        p_celebrity_id: userData.celebrity_id,
        p_role: role || 'support_agent',
        p_created_by: user.id
      })

    if (error) {
      console.error('Error creating invite code:', error)
      return NextResponse.json(
        { error: 'Failed to create invite code' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in invite code endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const supabase = await createClient()

    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .rpc('check_invite_code', {
        p_code: code
      })

    if (error) {
      console.error('Error checking invite code:', error)
      return NextResponse.json(
        { error: 'Failed to check invite code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ valid: data })
  } catch (error) {
    console.error('Error in invite code check endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 