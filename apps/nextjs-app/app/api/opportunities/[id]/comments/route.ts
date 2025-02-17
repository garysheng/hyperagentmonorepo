import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'

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
    const supabase = await createClient()

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

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opportunity_id } = await context.params
    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { data: comment, error } = await supabase
      .from('opportunity_comments')
      .insert({
        content,
        opportunity_id,
        user_id: user.id,
      })
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
      .single() as unknown as { data: CommentWithUser, error: PostgrestError | null }

    if (error) throw error

    // Transform the response to match our type
    const commentWithUser = {
      ...comment,
      user_id: comment.users?.id || comment.user_id,
      user: comment.users ? {
        id: comment.users.id,
        full_name: comment.users.full_name,
        email: comment.users.email
      } : null
    }

    return NextResponse.json(commentWithUser)
  } catch (error) {
    console.error('Error creating opportunity comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}