'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MessagesSquare, Goal, AlertCircle, BarChart3 } from 'lucide-react'

export function Overview() {
  const supabase = createClientComponentClient()

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get total DMs
      const { count: totalDMs } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('celebrity_id', user.id)

      // Get DMs by status
      const { data: statusCounts } = await supabase
        .from('opportunities')
        .select('status')
        .eq('celebrity_id', user.id)

      const dmsByStatus = statusCounts?.reduce((acc, { status }) => {
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Get average relevance score
      const { data: scores } = await supabase
        .from('opportunities')
        .select('relevance_score')
        .eq('celebrity_id', user.id)

      const avgScore = scores?.reduce((sum, { relevance_score }) => sum + relevance_score, 0) || 0
      const averageRelevance = scores?.length ? (avgScore / scores.length).toFixed(1) : '0.0'

      // Get DMs needing discussion
      const { count: needsDiscussion } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('celebrity_id', user.id)
        .eq('needs_discussion', true)

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
          <div className="text-2xl font-bold">{stats?.totalDMs}</div>
          <p className="text-xs text-muted-foreground">
            Across all statuses
          </p>
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
          <div className="text-2xl font-bold">{stats?.averageRelevance}</div>
          <p className="text-xs text-muted-foreground">
            Out of 5.0
          </p>
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
          <div className="text-2xl font-bold">{stats?.needsDiscussion}</div>
          <p className="text-xs text-muted-foreground">
            Flagged for team review
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Goals
          </CardTitle>
          <Goal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.entries(stats?.dmsByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize">{status}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 