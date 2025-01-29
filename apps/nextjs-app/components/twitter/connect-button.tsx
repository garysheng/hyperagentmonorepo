'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Twitter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'

interface ConnectTwitterButtonProps {
  isConnected?: boolean
  screenName?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function ConnectTwitterButton({ isConnected, screenName, onSuccess, onError }: ConnectTwitterButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/twitter')
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      }

      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect to Twitter'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/twitter/disconnect', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      toast({
        title: 'Success',
        description: 'Twitter account disconnected successfully'
      })

      // Invalidate queries that might have Twitter data
      queryClient.invalidateQueries({ queryKey: ['twitter-auth'] })
      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect Twitter'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isConnected) {
    return (
      <Button
        variant="outline"
        onClick={handleDisconnect}
        disabled={isLoading}
        className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-red-500/20"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Disconnecting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Disconnect @{screenName}
          </span>
        )}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={handleConnect}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Twitter className="h-4 w-4" />
          Connecting...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Twitter className="h-4 w-4" />
          Connect Twitter
        </span>
      )}
    </Button>
  )
} 