'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  const supabase = createClient()

  const { data: teamMembers, isLoading, error } = useQuery({
    queryKey: ['team-activity'],
    queryFn: async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw new Error(`Auth error: ${authError.message}`)
        if (!user) throw new Error('Not authenticated')

        // Get team members with their action counts and last action
        const { data: members, error: membersError } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            role,
            created_at
          `)
          .order('full_name')

        if (membersError) throw new Error(`Members query error: ${membersError.message}`)
        if (!members) return []

        console.log('Found team members:', members.length)

        // For each member, get their action stats
        const membersWithStats = await Promise.all(
          members.map(async (member) => {
            try {
              const [actionCountResult, lastActionResult, actionTypesResult] = await Promise.all([
                supabase
                  .from('opportunity_actions')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', member.id),
                supabase
                  .from('opportunity_actions')
                  .select('created_at')
                  .eq('user_id', member.id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single(),
                supabase
                  .from('opportunity_actions')
                  .select('type')
                  .eq('user_id', member.id)
                  .order('created_at', { ascending: false })
              ])

              if (actionCountResult.error) console.error(`Action count error for ${member.id}:`, actionCountResult.error)
              if (lastActionResult.error && lastActionResult.error.code !== 'PGRST116') {
                console.error(`Last action error for ${member.id}:`, lastActionResult.error)
              }
              if (actionTypesResult.error) console.error(`Action types error for ${member.id}:`, actionTypesResult.error)

              return {
                ...member,
                actionCount: actionCountResult.count || 0,
                lastAction: lastActionResult.data?.created_at || null,
                actionTypes: [...new Set(actionTypesResult.data?.map(a => a.type) || [])]
              }
            } catch (error) {
              console.error(`Error processing member ${member.id}:`, error)
              return {
                ...member,
                actionCount: 0,
                lastAction: null,
                actionTypes: []
              }
            }
          })
        )

        console.log('Processed team members with stats:', membersWithStats.length)
        return membersWithStats as TeamMember[]
      } catch (error) {
        console.error('Team activity query error:', error)
        throw error
      }
    },
    retry: 1
  })

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading team activity: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    )
  }

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
      ) : teamMembers && teamMembers.length > 0 ? (
        teamMembers.map((member) => (
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
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No team members found
        </div>
      )}
    </div>
  )
} 