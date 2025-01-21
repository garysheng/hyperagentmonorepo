'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ActionWithRelations {
  id: string
  type: string
  created_at: string
  user: {
    full_name: string
  }
}

interface DMWithRelations {
  id: string
  sender_handle: string
  status: string
  created_at: string
  content: string
}

export function RecentActivity() {
  const supabase = createClient()

  const { data: recentActions, isLoading: isLoadingActions } = useQuery({
    queryKey: ['recent-actions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Recent Actions - Auth user:', user)
      if (!user) throw new Error('Not authenticated')

      // Get the user's profile to get the celebrity_id
      const { data: userProfile } = await supabase
        .from('users')
        .select('celebrity_id')
        .eq('id', user.id)
        .single()
      console.log('Recent Actions - User profile:', userProfile)

      if (!userProfile?.celebrity_id) throw new Error('No celebrity profile found')

      const { data } = await supabase
        .from('opportunity_actions')
        .select(`
          id,
          action_type,
          created_at,
          user:users!inner(full_name)
        `)
        .eq('celebrity_id', userProfile.celebrity_id)
        .order('created_at', { ascending: false })
        .limit(5)
      console.log('Recent Actions - Raw data:', data)

      const mappedData = (data || []).map(item => ({
        id: item.id,
        type: item.action_type,
        created_at: item.created_at,
        user: {
          full_name: item.user[0].full_name
        }
      }))
      console.log('Recent Actions - Mapped data:', mappedData)

      return mappedData as ActionWithRelations[]
    }
  })

  const { data: recentDMs, isLoading: isLoadingDMs } = useQuery({
    queryKey: ['recent-dms'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Recent DMs - Auth user:', user)
      if (!user) throw new Error('Not authenticated')

      // Get the user's profile to get the celebrity_id
      const { data: userProfile } = await supabase
        .from('users')
        .select('celebrity_id')
        .eq('id', user.id)
        .single()
      console.log('Recent DMs - User profile:', userProfile)

      if (!userProfile?.celebrity_id) throw new Error('No celebrity profile found')

      const { data } = await supabase
        .from('opportunities')
        .select('id, sender_handle, status, created_at, initial_content')
        .eq('celebrity_id', userProfile.celebrity_id)
        .order('created_at', { ascending: false })
        .limit(5)
      console.log('Recent DMs - Raw data:', data)

      const mappedData = (data || []).map(dm => ({
        ...dm,
        content: dm.initial_content
      }))
      console.log('Recent DMs - Mapped data:', mappedData)

      return mappedData as DMWithRelations[]
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent DMs</CardTitle>
          <CardDescription>Latest direct messages received</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingDMs ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </>
          ) : (
            recentDMs?.map((dm) => (
              <div key={dm.id} className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">@{dm.sender_handle}</span>
                  <Badge variant="outline" className="capitalize">{dm.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{dm.content}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
          <CardDescription>Latest team member activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingActions ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </>
          ) : (
            recentActions?.map((action) => (
              <div key={action.id} className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{action.user.full_name}</span>
                  <Badge variant="outline" className="capitalize">{action.type.replace('_', ' ')}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
} 