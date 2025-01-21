import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { OpportunityAction } from '@/types/actions'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

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

    const { type, payload } = (await request.json()) as OpportunityAction
    const now = new Date().toISOString()

    switch (type) {
      case 'upgrade_relevance': {
        const { data, error } = await supabase
          .from('opportunities')
          .update({
            relevance_score: payload.relevance_score,
            relevance_override_explanation: payload.explanation,
            relevance_override_by: user.id,
            relevance_override_at: now,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      }

      case 'downgrade_relevance': {
        const { data, error } = await supabase
          .from('opportunities')
          .update({
            relevance_score: 1,
            status: 'rejected',
            relevance_override_explanation: payload.explanation,
            relevance_override_by: user.id,
            relevance_override_at: now,
            status_updated_by: user.id,
            status_updated_at: now,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      }

      case 'assign_goal': {
        const { data, error } = await supabase
          .from('opportunities')
          .update({
            goal_id: payload.goal_id,
            status_updated_by: user.id,
            status_updated_at: now,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      }

      case 'assign_user': {
        const { data, error } = await supabase
          .from('opportunities')
          .update({
            assigned_to: payload.user_id,
            status_updated_by: user.id,
            status_updated_at: now,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      }

      case 'flag_discussion': {
        const { data, error } = await supabase
          .from('opportunities')
          .update({
            needs_discussion: payload.needs_discussion,
            status_updated_by: user.id,
            status_updated_at: now,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      }

      case 'update_status': {
        const { data, error } = await supabase
          .from('opportunities')
          .update({
            status: payload.status,
            status_updated_by: user.id,
            status_updated_at: now,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      }

      case 'add_comment': {
        const { data, error } = await supabase
          .from('opportunity_comments')
          .insert({
            opportunity_id: id,
            user_id: user.id,
            content: payload.content,
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      }

      case 'update_tags': {
        const { data, error } = await supabase
          .from('opportunities')
          .update({
            tags: payload.tags,
            status_updated_by: user.id,
            status_updated_at: now,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(data)
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing opportunity action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 