export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Delete the Twitter auth record
    const { error: deleteError } = await supabase
      .from('twitter_auth')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error disconnecting Twitter:', deleteError)
      return NextResponse.json(
        { error: 'Failed to disconnect Twitter' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Twitter:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}