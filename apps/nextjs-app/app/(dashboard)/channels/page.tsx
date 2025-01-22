'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectTwitterButton } from '@/components/twitter/connect-button'
import { Code } from '@/components/ui/code'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Twitter, CheckCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

export default function ChannelsPage() {
  const supabase = createClient()

  const { data: twitterAuth } = useQuery({
    queryKey: ['twitter-auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('twitter_auth')
        .select('screen_name, twitter_id, updated_at')
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

  const widgetCode = `<script
  src="${process.env.NEXT_PUBLIC_APP_URL}/widget.js"
  data-celebrity-id="${celebrityId || 'YOUR_CELEBRITY_ID'}"
></script>`

  return (
    <div className="container space-y-8 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts and install the chat widget
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
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Twitter Connected</AlertTitle>
                <AlertDescription>
                  Your Twitter account @{twitterAuth.screen_name} is connected and ready to receive DMs.
                </AlertDescription>
              </Alert>
            ) : (
              <ConnectTwitterButton />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat Widget</CardTitle>
            <CardDescription>
              Install our chat widget on your website to collect messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Installation Instructions</AlertTitle>
              <AlertDescription>
                Add the following script tag to your website&apos;s HTML, ideally just before the closing &lt;/body&gt; tag.
              </AlertDescription>
            </Alert>

            <Code className="text-sm">
              {widgetCode}
            </Code>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Need help?</AlertTitle>
              <AlertDescription>
                Contact our support team for assistance with widget installation or customization.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 