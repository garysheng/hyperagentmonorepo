'use client'

import { Button } from '@/components/ui/button'
import { Twitter } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ConnectTwitterButtonProps {
  className?: string
}

export function ConnectTwitterButton({ className }: ConnectTwitterButtonProps) {
  const router = useRouter()

  const handleConnect = async () => {
    try {
      router.push('/api/twitter/auth')
    } catch (error) {
      console.error('Failed to connect Twitter:', error)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleConnect}
      className={className}
    >
      <Twitter className="mr-2 h-4 w-4" />
      Connect Twitter
    </Button>
  )
} 