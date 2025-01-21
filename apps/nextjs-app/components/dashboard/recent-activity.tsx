'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface ActionWithRelations {
  id: string
  action_type: string
  created_at: string
  user: {
    full_name: string
  } | null
  opportunity: {
    sender_handle: string
  } | null
}

export function RecentActivity() {
  const supabase = createClientComponentClient()

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get recent DMs
      const { data: recentDMs } = await supabase
        .from('opportunities')
        .select(`
          id,
          sender_handle,
          initial_content,
          created_at,
          status,
          relevance_score
        `)
        .eq('celebrity_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Get recent actions
      const { data: recentActions } = await supabase
        .from('opportunity_actions')
        .select(`
          id,
          action_type,
          created_at,
          user:users!opportunity_actions_user_id_fkey (
            full_name
          ),
          opportunity:opportunities!opportunity_actions_opportunity_id_fkey (
            sender_handle
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5) as { data: ActionWithRelations[] | null }

      return {
        recentDMs: recentDMs || [],
        recentActions: recentActions || [],
      }
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent DMs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity?.recentDMs.map(dm => (
              <div key={dm.id} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">@{dm.sender_handle}</span>
                    <Badge variant="outline">{dm.status}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {dm.initial_content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity?.recentActions.map(action => (
              <div key={action.id} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{action.user?.full_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {action.action_type.replace(/_/g, ' ')} on @{action.opportunity?.sender_handle}'s DM
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 