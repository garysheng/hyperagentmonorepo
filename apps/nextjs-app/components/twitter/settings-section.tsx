'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectTwitterButton } from './connect-button'
import { useTwitterAuth } from '@/hooks/use-twitter-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Twitter, XCircle } from 'lucide-react'

export function TwitterSettingsSection() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isLoading, isAuthenticated, screenName } = useTwitterAuth()

  // Handle OAuth callback params
  useEffect(() => {
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    }

    if (success) {
      toast({
        title: 'Success',
        description: success,
      })
    }
  }, [searchParams, toast])

  const handleDisconnect = async () => {
    // TODO: Implement disconnect functionality
    toast({
      title: 'Not implemented',
      description: 'Disconnect functionality coming soon',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Twitter Connection</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Twitter Connection</CardTitle>
        <CardDescription>
          Connect your Twitter account to manage DMs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Twitter className="h-4 w-4" />
              <span>Connected as @{screenName}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full sm:w-auto"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Disconnect Twitter
            </Button>
          </div>
        ) : (
          <ConnectTwitterButton />
        )}
      </CardContent>
    </Card>
  )
} 