'use client'

import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

interface TeamMember {
  id: string
  full_name: string
  role: string
  created_at: string
  actionCount: number
  lastAction: string | null
  actionTypes: string[]
}

export function TeamActivity() {
  const supabase = createClientComponentClient()

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-activity'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get team members with their action counts and last action
      const { data: members } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          role,
          created_at
        `)
        .order('full_name')

      if (!members) return []

      // For each member, get their action stats
      const membersWithStats = await Promise.all(
        members.map(async (member) => {
          const { count: actionCount } = await supabase
            .from('actions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.id)

          const { data: lastActionData } = await supabase
            .from('actions')
            .select('created_at')
            .eq('user_id', member.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          const { data: actionTypes } = await supabase
            .from('actions')
            .select('type')
            .eq('user_id', member.id)
            .order('created_at', { ascending: false })

          return {
            ...member,
            actionCount: actionCount || 0,
            lastAction: lastActionData?.created_at || null,
            actionTypes: [...new Set(actionTypes?.map(a => a.type) || [])]
          }
        })
      )

      return membersWithStats as TeamMember[]
    }
  })

  return (
    <div className="space-y-8">
      {isLoading ? (
        <>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </>
      ) : (
        teamMembers?.map((member) => (
          <div key={member.id} className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {member.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium leading-none">{member.full_name}</p>
                <p className="text-sm text-muted-foreground">·</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {member.actionCount} actions
                {member.lastAction && ` · Last active ${formatDistanceToNow(new Date(member.lastAction), { addSuffix: true })}`}
              </p>
              {member.actionTypes.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Most common: {member.actionTypes.slice(0, 3).map(type => type.replace('_', ' ')).join(', ')}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
} 