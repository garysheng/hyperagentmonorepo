'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { Overview } from '@/components/dashboard/overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TeamActivity } from '@/components/dashboard/team-activity'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConnectTwitterButton } from '@/components/twitter/connect-button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQuery } from '@tanstack/react-query'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = createClientComponentClient()

  // Check if user has connected Twitter
  const { data: twitterAuth, isLoading: checkingTwitter } = useQuery({
    queryKey: ['twitter-auth', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data } = await supabase
        .from('twitter_auth')
        .select('*')
        .eq('user_id', user.id)
        .single()
      return data
    },
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return null
  }

  return (
    <div className="container mx-auto space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {!checkingTwitter && !twitterAuth && (
          <ConnectTwitterButton />
        )}
      </div>
      
      {twitterAuth ? (
        <>
          <Overview />
          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="team">Team Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="space-y-4">
              <RecentActivity />
            </TabsContent>
            <TabsContent value="team" className="space-y-4">
              <TeamActivity />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">Connect Your Twitter Account</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Connect your Twitter account to start managing your DMs and opportunities.
          </p>
          {!checkingTwitter && <ConnectTwitterButton />}
        </div>
      )}
    </div>
  )
} 