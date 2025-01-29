'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { Overview } from '@/components/dashboard/overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TeamActivity } from '@/components/dashboard/team-activity'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto space-y-6 p-8 pt-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Dashboard
          </h2>
        </div>
        
        {/* Overview Stats */}
        <Overview />

        {/* Activity Tabs */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-2 border-muted p-1 h-12">
            <TabsTrigger 
              value="recent"
              className={cn(
                "transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=active]:shadow-lg relative px-6 h-9"
              )}
            >
              Recent Activity
            </TabsTrigger>
            <TabsTrigger 
              value="team"
              className={cn(
                "transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=active]:shadow-lg relative px-6 h-9"
              )}
            >
              Team Activity
            </TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="space-y-4">
            <RecentActivity />
          </TabsContent>
          <TabsContent value="team" className="space-y-4">
            <TeamActivity />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 