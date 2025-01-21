'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Twitter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConnectTwitterButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function ConnectTwitterButton({ onSuccess, onError }: ConnectTwitterButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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