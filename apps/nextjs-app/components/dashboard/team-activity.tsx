'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

export function TeamActivity() {
  const supabase = createClientComponentClient()

  const { data: teamActivity } = useQuery({
    queryKey: ['team-activity'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get team members
      const { data: teamMembers } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          role,
          created_at
        `)
        .eq('celebrity_id', user.id)

      // Get team member stats
      const { data: memberStats } = await supabase
        .from('opportunity_actions')
        .select(`
          user_id,
          action_type,
          created_at
        `)
        .order('created_at', { ascending: false })

      // Calculate stats per team member
      const stats = teamMembers?.map(member => {
        const actions = memberStats?.filter(stat => stat.user_id === member.id) || []
        const lastAction = actions[0]
        const actionCount = actions.length

        return {
          ...member,
          actionCount,
          lastAction: lastAction?.created_at,
          actionTypes: actions.reduce((acc, { action_type }) => {
            acc[action_type] = (acc[action_type] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        }
      })

      return {
        teamStats: stats || []
      }
    }
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Team Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {teamActivity?.teamStats.map(member => (
              <div key={member.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${member.id}`} />
                  <AvatarFallback>
                    {member.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{member.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground text-right">
                  <p>{member.actionCount} actions</p>
                  {member.lastAction && (
                    <p>Last active {formatDistanceToNow(new Date(member.lastAction), { addSuffix: true })}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 