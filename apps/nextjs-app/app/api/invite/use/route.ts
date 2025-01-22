import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
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

    // Use the invite code
    const { data, error } = await supabase
      .rpc('use_invite_code', {
        p_code: code,
        p_user_id: user.id
      })

    if (error) {
      console.error('Error using invite code:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Update the user's role and celebrity_id
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: data.role,
        celebrity_id: data.celebrity_id
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      role: data.role,
      celebrity_id: data.celebrity_id
    })
  } catch (error) {
    console.error('Error in use invite code endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 