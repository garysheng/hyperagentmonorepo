'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Activity, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCelebrity } from '@/hooks/use-celebrity'

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
  const { data: celebrity } = useCelebrity()

  const { data: teamMembers, isLoading, error } = useQuery({
    queryKey: ['team-activity', celebrity?.id],
    queryFn: async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw new Error(`Auth error: ${authError.message}`)
        if (!user) throw new Error('Not authenticated')
        if (!celebrity?.id) throw new Error('No celebrity profile found')

        // Get team members with their action counts and last action
        const { data: members, error: membersError } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            role,
            created_at
          `)
          .eq('celebrity_id', celebrity.id)
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
                  .eq('user_id', member.id)
                  .eq('celebrity_id', celebrity.id),
                supabase
                  .from('opportunity_actions')
                  .select('created_at')
                  .eq('user_id', member.id)
                  .eq('celebrity_id', celebrity.id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single(),
                supabase
                  .from('opportunity_actions')
                  .select('type')
                  .eq('user_id', member.id)
                  .eq('celebrity_id', celebrity.id)
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
    enabled: !!celebrity?.id,
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
    <Card className="border-t-4 border-t-gradient-to-r from-blue-500 to-purple-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Team Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isLoading ? (
            <>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            </>
          ) : teamMembers && teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="group flex items-start space-x-4 rounded-lg p-3 transition-colors hover:bg-muted/50 hover:shadow-md"
              >
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-2 ring-blue-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    {member.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{member.full_name}</p>
                    <Badge variant="outline" className="text-xs border-blue-500/50">
                      {member.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{member.actionCount} actions</span>
                    </div>
                    {member.lastAction && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Last active {formatDistanceToNow(new Date(member.lastAction), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                  {member.actionTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {member.actionTypes.slice(0, 3).map((type, index) => (
                        <Badge 
                          key={type} 
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            index === 0 && "bg-blue-500/10 text-blue-500",
                            index === 1 && "bg-purple-500/10 text-purple-500",
                            index === 2 && "bg-pink-500/10 text-pink-500"
                          )}
                        >
                          {type.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No team members found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 