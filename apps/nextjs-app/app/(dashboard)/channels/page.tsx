'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectTwitterButton } from '@/components/twitter/connect-button'
import { Code } from '@/components/ui/code'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export default function ChannelsPage() {
  const supabase = createClient()

  const { data: celebrityId } = useQuery({
    queryKey: ['celebrity-id'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: userProfile } = await supabase
        .from('users')
        .select('celebrity_id')
        .eq('id', user.id)
        .single()

      return userProfile?.celebrity_id
    }
  })

  const widgetCode = `<script
  src="https://widget.gauntlet.ai/v1/widget.js"
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
            <CardTitle>Twitter</CardTitle>
            <CardDescription>
              Connect your Twitter account to monitor and respond to DMs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectTwitterButton />
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