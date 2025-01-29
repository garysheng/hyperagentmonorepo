'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectTwitterButton } from '@/components/twitter/connect-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Twitter, CheckCircle2, ExternalLink, Mail, Copy, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const channelStyles = {
  email: {
    gradient: "from-blue-500 to-blue-700",
    iconColor: "text-blue-500",
    bgGlow: "after:bg-blue-500/10 after:-z-10",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/50",
  },
  twitter: {
    gradient: "from-sky-500 to-sky-700",
    iconColor: "text-sky-500",
    bgGlow: "after:bg-sky-500/10 after:-z-10",
    badge: "bg-sky-500/10 text-sky-500 border-sky-500/50",
  },
  contact: {
    gradient: "from-purple-500 to-purple-700",
    iconColor: "text-purple-500",
    bgGlow: "after:bg-purple-500/10 after:-z-10",
    badge: "bg-purple-500/10 text-purple-500 border-purple-500/50",
  },
}

export default function ChannelsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

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

  const handleCopyEmail = async () => {
    if (!celebrityId) return
    const email = `postmaster+team+${celebrityId}@hyperagent.so`
    await navigator.clipboard.writeText(email)
    setCopied(true)
    toast({
      title: 'Email copied',
      description: 'The email address has been copied to your clipboard.'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container space-y-8 py-8 pl-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
          Channels
        </h1>
        <p className="text-muted-foreground">
          Connect your social media accounts and manage your contact channels
        </p>
      </div>

      <div className="grid gap-8">
        <Card className={cn(
          "relative overflow-hidden transition-shadow hover:shadow-xl",
          "after:absolute after:inset-0 after:opacity-20 after:transition-opacity hover:after:opacity-30",
          channelStyles.email.bgGlow
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={cn(
                  "bg-gradient-to-br bg-clip-text text-transparent",
                  channelStyles.email.gradient
                )}>Email</CardTitle>
                <CardDescription>
                  Receive and respond to email inquiries through your dedicated email address
                </CardDescription>
              </div>
              <Badge variant="outline" className={cn("gap-2", channelStyles.email.badge)}>
                <Mail className="h-3 w-3" />
                <span>Always On</span>
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="bg-blue-500/5 border-blue-500/20">
              <CheckCircle2 className={channelStyles.email.iconColor} />
              <AlertTitle>Email Channel Active</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>Your dedicated email address is ready to receive inquiries.</p>
                <div className="flex items-center gap-2 relative z-10">
                  <code className="relative rounded bg-blue-500/5 px-[0.5rem] py-[0.3rem] font-mono text-sm border border-blue-500/20">
                    {celebrityId ? `postmaster+team+${celebrityId}@hyperagent.so` : 'Loading...'}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyEmail}
                    disabled={!celebrityId}
                    className="hover:bg-blue-500/10 hover:text-blue-500 relative z-10"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className={cn(
          "relative overflow-hidden transition-shadow hover:shadow-xl",
          "after:absolute after:inset-0 after:opacity-20 after:transition-opacity hover:after:opacity-30",
          channelStyles.twitter.bgGlow
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={cn(
                  "bg-gradient-to-br bg-clip-text text-transparent",
                  channelStyles.twitter.gradient
                )}>Twitter</CardTitle>
                <CardDescription>
                  Connect your Twitter account to monitor and respond to DMs
                </CardDescription>
              </div>
              {twitterAuth && (
                <Badge variant="outline" className={cn("gap-2", channelStyles.twitter.badge)}>
                  <Twitter className="h-3 w-3" />
                  <span>@{twitterAuth.screen_name}</span>
                  <CheckCircle2 className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {twitterAuth ? (
              <>
                <Alert className="mb-4 bg-sky-500/5 border-sky-500/20">
                  <CheckCircle2 className={channelStyles.twitter.iconColor} />
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

        <Card className={cn(
          "relative overflow-hidden transition-shadow hover:shadow-xl",
          "after:absolute after:inset-0 after:opacity-20 after:transition-opacity hover:after:opacity-30",
          channelStyles.contact.bgGlow
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "bg-gradient-to-br bg-clip-text text-transparent",
              channelStyles.contact.gradient
            )}>Contact Page</CardTitle>
            <CardDescription>
              Your public contact page where people can reach out with opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {celebrityId ? (
              <>
                <Alert className="mb-4 bg-purple-500/5 border-purple-500/20">
                  <Info className={channelStyles.contact.iconColor} />
                  <AlertTitle className="flex items-center justify-between">
                    <span>Your Contact Page</span>
                    <Link href={`/contact/${celebrityId}`} target="_blank" className="inline-block relative z-10">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 hover:bg-purple-500/10 hover:text-purple-500 relative z-10"
                      >
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
              <Alert className="bg-purple-500/5 border-purple-500/20">
                <Info className={channelStyles.contact.iconColor} />
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