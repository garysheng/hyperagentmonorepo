'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { Overview } from '@/components/dashboard/overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TeamActivity } from '@/components/dashboard/team-activity'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

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
      </div>
      
      {/* Overview Stats */}
      <Overview />

      {/* Activity Tabs */}
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
    </div>
  )
} 