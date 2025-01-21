import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type CommentWithUser = {
  id: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
  users: {
    id: string
    full_name: string
    email: string
  } | null
}

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
        user_id,
        created_at,
        updated_at,
        users!opportunity_comments_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('opportunity_id', id)
      .order('created_at', { ascending: true })
      .returns<CommentWithUser[]>()

    if (error) throw error

    // Transform the response to match our type, handling null users
    const commentsWithUser = data.map(comment => ({
      ...comment,
      user_id: comment.users?.id || comment.user_id, // Fallback to the foreign key
      user: comment.users ? {
        id: comment.users.id,
        full_name: comment.users.full_name,
        email: comment.users.email
      } : null
    }))

    return NextResponse.json(commentsWithUser)
  } catch (error) {
    console.error('Error fetching opportunity comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 