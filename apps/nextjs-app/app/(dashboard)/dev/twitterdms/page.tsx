'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface TwitterDM {
  id: string
  text: string
  sender_id: string
  sender_screen_name: string
  created_at: string
}

export default function TwitterDMsPage() {
  const supabase = createClient()

  const { data: twitterAuth } = useQuery({
    queryKey: ['twitter-auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('twitter_auth')
        .select('access_token, refresh_token')
        .eq('user_id', user.id)
        .single()

      return data
    }
  })

  const { data: dms, isLoading, error } = useQuery({
    queryKey: ['twitter-dms'],
    enabled: !!twitterAuth,
    queryFn: async () => {
      const response = await fetch('/api/dev/twitter/dms')
      if (!response.ok) {
        throw new Error('Failed to fetch DMs')
      }
      return response.json() as Promise<TwitterDM[]>
    }
  })

  return (
    <div className="container space-y-8 py-8 pl-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Twitter DMs (Dev)</h1>
        <p className="text-muted-foreground">
          View recent Twitter DM threads for development purposes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent DM Threads</CardTitle>
          <CardDescription>
            Showing the last 10 DM threads from Twitter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load DMs. Make sure your Twitter account is connected.
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : dms?.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No DM threads found.
              </AlertDescription>
            </Alert>
          ) : (
            dms?.map((dm) => (
              <div key={dm.id} className="flex flex-col space-y-1 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">@{dm.sender_screen_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{dm.text}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
} 