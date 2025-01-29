'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Target, Mail } from 'lucide-react'
import { useCelebrity } from '@/hooks/use-celebrity'
import { cn } from '@/lib/utils'

interface TeamMember {
  id: string
  full_name: string
  email: string
  role: string
  goals: {
    id: string
    name: string
    priority: number
  }[]
}

export function TeamMemberList() {
  const supabase = createClient()
  const { data: celebrity } = useCelebrity()

  const { data: teamMembers, isLoading, error } = useQuery({
    queryKey: ['team-members-list', celebrity?.id],
    queryFn: async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw new Error(`Auth error: ${authError.message}`)
        if (!user) throw new Error('Not authenticated')
        if (!celebrity?.id) throw new Error('No celebrity profile found')

        // Get team members with their roles
        const { data: members, error: membersError } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            email,
            role
          `)
          .eq('celebrity_id', celebrity.id)
          .order('full_name')

        if (membersError) throw new Error(`Members query error: ${membersError.message}`)
        if (!members) return []

        // For each member, get their assigned goals
        const membersWithGoals = await Promise.all(
          members.map(async (member) => {
            const { data: goals, error: goalsError } = await supabase
              .from('goals')
              .select('id, name, priority')
              .eq('celebrity_id', celebrity.id)
              .eq('default_user_id', member.id)
              .order('priority', { ascending: false })

            if (goalsError) {
              console.error(`Goals query error for ${member.id}:`, goalsError)
              return { ...member, goals: [] }
            }

            return {
              ...member,
              goals: goals || []
            }
          })
        )

        return membersWithGoals as TeamMember[]
      } catch (error) {
        console.error('Team members list query error:', error)
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
          Error loading team members: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    )
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/50'
      case 'manager':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/50'
      case 'member':
        return 'bg-green-500/10 text-green-500 border-green-500/50'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/50'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-500/10 text-red-500'
    if (priority >= 5) return 'bg-orange-500/10 text-orange-500'
    return 'bg-blue-500/10 text-blue-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5 text-primary" />
          Team Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </>
          ) : teamMembers && teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="group flex items-start space-x-4 rounded-lg p-4 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary/10">
                    {member.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{member.full_name}</p>
                        <Badge variant="outline" className={cn("text-xs", getRoleColor(member.role))}>
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </div>
                    </div>
                  </div>
                  {member.goals.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                        <Target className="h-3 w-3" />
                        Auto-Assigned to opportunities flagged as relevant to:
                      </span>
                      {member.goals.map((goal) => (
                        <Badge 
                          key={goal.id}
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            getPriorityColor(goal.priority)
                          )}
                        >
                          {goal.name}
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