import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { OpportunityAction } from '@/types/actions'
import { PostgrestError } from '@supabase/supabase-js'

type ActionValue = {
  score?: number
  status?: string
  explanation?: string
  goal_id?: string
  user_id?: string
  needs_discussion?: boolean
  tags?: string[]
  content?: string
} | null

type ActionWithUser = {
  id: string
  type: string
  metadata: Record<string, unknown>
  user_id: string
  created_at: string
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
      .from('opportunity_actions')
      .select(`
        id,
        type,
        metadata,
        user_id,
        created_at,
        users!opportunity_actions_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('opportunity_id', id)
      .order('created_at', { ascending: true })
      .returns<ActionWithUser[]>()

    if (error) throw error

    // Transform the response to match our type
    const actionsWithUser = data.map(action => ({
      ...action,
      user_id: action.users?.id || action.user_id,
      user: action.users ? {
        id: action.users.id,
        full_name: action.users.full_name,
        email: action.users.email
      } : null
    }))

    return NextResponse.json(actionsWithUser)
  } catch (error) {
    console.error('Error fetching opportunity actions:', error)
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
  const { id } = await context.params

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

    const { type, payload } = (await request.json()) as OpportunityAction
    const now = new Date().toISOString()

    // Helper function to record action
    const recordAction = async (actionType: string, oldValue: ActionValue, newValue: ActionValue) => {
      const { error } = await supabase
        .from('opportunity_actions')
        .insert({
          opportunity_id: id,
          user_id: user.id,
          action_type: actionType,
          old_value: oldValue,
          new_value: newValue,
        })

      if (error) {
        console.error('Error recording action:', error)
      }
    }

    switch (type) {
      case 'upgrade_relevance': {
        const { data: currentOpp } = await supabase
          .from('opportunities')
          .select('relevance_score')
          .eq('id', id)
          .single()

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

        await recordAction('upgrade_relevance', 
          { score: currentOpp?.relevance_score }, 
          { score: payload.relevance_score, explanation: payload.explanation }
        )

        return NextResponse.json(data)
      }

      case 'downgrade_relevance': {
        const { data: currentOpp } = await supabase
          .from('opportunities')
          .select('relevance_score, status')
          .eq('id', id)
          .single()

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

        await recordAction('downgrade_relevance', 
          { score: currentOpp?.relevance_score, status: currentOpp?.status }, 
          { score: 1, status: 'rejected', explanation: payload.explanation }
        )

        return NextResponse.json(data)
      }

      case 'assign_goal': {
        const { data: currentOpp } = await supabase
          .from('opportunities')
          .select('goal_id')
          .eq('id', id)
          .single()

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

        await recordAction('assign_goal',
          { goal_id: currentOpp?.goal_id },
          { goal_id: payload.goal_id }
        )

        return NextResponse.json(data)
      }

      case 'assign_user': {
        const { data: currentOpp } = await supabase
          .from('opportunities')
          .select('assigned_to')
          .eq('id', id)
          .single()

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

        await recordAction('assign_user',
          { user_id: currentOpp?.assigned_to },
          { user_id: payload.user_id }
        )

        return NextResponse.json(data)
      }

      case 'flag_discussion': {
        const { data: currentOpp } = await supabase
          .from('opportunities')
          .select('needs_discussion')
          .eq('id', id)
          .single()

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

        await recordAction('flag_discussion',
          { needs_discussion: currentOpp?.needs_discussion },
          { needs_discussion: payload.needs_discussion }
        )

        return NextResponse.json(data)
      }

      case 'update_status': {
        const { data: currentOpp } = await supabase
          .from('opportunities')
          .select('status')
          .eq('id', id)
          .single()

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

        await recordAction('update_status',
          { status: currentOpp?.status },
          { status: payload.status }
        )

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

        await recordAction('add_comment',
          null,
          { content: payload.content }
        )

        return NextResponse.json(data)
      }

      case 'update_tags': {
        const { data: currentOpp } = await supabase
          .from('opportunities')
          .select('tags')
          .eq('id', id)
          .single()

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

        await recordAction('update_tags',
          { tags: currentOpp?.tags },
          { tags: payload.tags }
        )

        return NextResponse.json(data)
      }

      case 'trigger_classification': {
        const { data, error } = await supabase
          .rpc('trigger_classification', { opportunity_id: id })
          .single()

        if (error) throw error

        await recordAction('trigger_classification',
          null,
          null
        )

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