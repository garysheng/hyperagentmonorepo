'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectTwitterButton } from '@/components/twitter/connect-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Twitter, CheckCircle2, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ChannelsPage() {
  const supabase = createClient()

  const { data: twitterAuth } = useQuery({
    queryKey: ['twitter-auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('twitter_auth')
        .select('*')
        .eq('user_id', user.id)
        .single()

      return data
    }
  })

  const { data: celebrityId } = useQuery({
    queryKey: ['celebrity-id'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('users')
        .select('celebrity_id')
        .eq('id', user.id)
        .single()

      return data?.celebrity_id
    }
  })

  return (
    <div className="container space-y-8 py-8 pl-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts and manage your contact channels
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Twitter</CardTitle>
                <CardDescription>
                  Connect your Twitter account to monitor and respond to DMs
                </CardDescription>
              </div>
              {twitterAuth && (
                <Badge variant="outline" className="gap-2">
                  <Twitter className="h-3 w-3" />
                  <span>@{twitterAuth.screen_name}</span>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {twitterAuth ? (
              <>
                <Alert className="mb-4">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>Twitter Connected</AlertTitle>
                  <AlertDescription>
                    Your Twitter account @{twitterAuth.screen_name} is connected and ready to receive DMs.
                  </AlertDescription>
                </Alert>
                <ConnectTwitterButton 
                  isConnected={true} 
                  screenName={twitterAuth.screen_name} 
                />
              </>
            ) : (
              <ConnectTwitterButton />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Page</CardTitle>
            <CardDescription>
              Your public contact page where people can reach out with opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {celebrityId ? (
              <>
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>Your Contact Page</span>
                    <Link href={`/contact/${celebrityId}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-2">
                        <span>View Page</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </AlertTitle>
                  <AlertDescription>
                    Share this page with people who want to propose business opportunities or collaborations. 
                    All messages will be collected and managed through your HyperAgent dashboard.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Setup Required</AlertTitle>
                <AlertDescription>
                  Your contact page is not set up yet. Please contact support for assistance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 