'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { MessagesSquare, Goal, AlertCircle, BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function Overview() {
  const supabase = createClient()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth user:', user)
      if (!user) throw new Error('Not authenticated')

      // Get the user's profile to get the celebrity_id
      const { data: userProfile } = await supabase
        .from('users')
        .select('celebrity_id')
        .eq('id', user.id)
        .single()
      console.log('User profile:', userProfile)

      if (!userProfile?.celebrity_id) throw new Error('No celebrity profile found')

      // Get total DMs
      const { count: totalDMs } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('celebrity_id', userProfile.celebrity_id)
      console.log('Total DMs:', totalDMs)

      // Get DMs by status
      const { data: statusCounts } = await supabase
        .from('opportunities')
        .select('status')
        .eq('celebrity_id', userProfile.celebrity_id)
      console.log('Status counts raw:', statusCounts)

      const dmsByStatus = statusCounts?.reduce((acc, { status }) => {
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
      console.log('DMs by status:', dmsByStatus)

      // Get average relevance score
      const { data: scores } = await supabase
        .from('opportunities')
        .select('relevance_score')
        .eq('celebrity_id', userProfile.celebrity_id)
        .not('relevance_score', 'is', null)
      console.log('Relevance scores:', scores)

      const avgScore = scores?.reduce((sum, { relevance_score }) => sum + relevance_score, 0) || 0
      const averageRelevance = scores?.length ? (avgScore / scores.length).toFixed(1) : '0.0'
      console.log('Average relevance:', averageRelevance)

      // Get DMs needing discussion
      const { count: needsDiscussion } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('celebrity_id', userProfile.celebrity_id)
        .eq('needs_discussion', true)
      console.log('Needs discussion count:', needsDiscussion)

      return {
        totalDMs: totalDMs || 0,
        dmsByStatus,
        averageRelevance,
        needsDiscussion: needsDiscussion || 0,
      }
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total DMs
          </CardTitle>
          <MessagesSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats?.totalDMs}</div>
              <p className="text-xs text-muted-foreground">
                Across all statuses
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Relevance
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats?.averageRelevance}</div>
              <p className="text-xs text-muted-foreground">
                Out of 5.0
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Need Discussion
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats?.needsDiscussion}</div>
              <p className="text-xs text-muted-foreground">
                Flagged for team review
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Status Breakdown
          </CardTitle>
          <Goal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats?.dmsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 