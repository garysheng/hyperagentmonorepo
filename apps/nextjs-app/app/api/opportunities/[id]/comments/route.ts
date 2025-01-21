import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('opportunity_comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('opportunity_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching opportunity comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 