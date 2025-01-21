import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: dms, error } = await supabase
      .from('opportunities')
      .select(`
        id,
        sender_id,
        sender_handle,
        initial_content,
        created_at,
        relevance_score,
        status,
        tags,
        goal_id,
        goal:goals(id, name, description),
        assigned_to,
        needs_discussion
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching DMs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to match our frontend expectations
    const dmsWithSender = dms.map((dm) => ({
      ...dm,
      message: dm.initial_content,
      sender: {
        username: dm.sender_handle,
        avatar_url: `https://api.dicebear.com/9.x/adventurer/svg?seed=${dm.sender_id}`,
      },
    }))

    return NextResponse.json(dmsWithSender)
  } catch (error) {
    console.error('Error in DMs route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 