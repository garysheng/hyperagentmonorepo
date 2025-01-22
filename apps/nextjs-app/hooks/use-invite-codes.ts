import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface InviteCode {
  id: string
  code: string
  expires_at: string
}

interface UseInviteCodesReturn {
  isLoading: boolean
  generateCode: (role?: 'admin' | 'support_agent') => Promise<InviteCode | null>
  validateCode: (code: string) => Promise<boolean>
  useCode: (code: string) => Promise<{ role: string; celebrity_id: string } | null>
}

export function useInviteCodes(): UseInviteCodesReturn {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const generateCode = async (role: 'admin' | 'support_agent' = 'support_agent'): Promise<InviteCode | null> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate invite code')
      }

      const data = await response.json()
      toast({
        title: 'Invite Code Generated',
        description: `Code: ${data.code} (expires in 7 days)`,
      })
      return data
    } catch (error) {
      console.error('Error generating invite code:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate invite code',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const validateCode = async (code: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/invite?code=${encodeURIComponent(code)}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to validate invite code')
      }

      const { valid } = await response.json()
      return valid
    } catch (error) {
      console.error('Error validating invite code:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const useCode = async (code: string): Promise<{ role: string; celebrity_id: string } | null> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/invite/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to use invite code')
      }

      const data = await response.json()
      toast({
        title: 'Success',
        description: 'Successfully joined team',
      })
      return data
    } catch (error) {
      console.error('Error using invite code:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to use invite code',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    generateCode,
    validateCode,
    useCode,
  }
} 