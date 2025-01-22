'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, fromUnixTime } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface TwitterDM {
  id: string
  text: string
  sender_id: string
  sender_screen_name: string
  created_at: string
  [key: string]: unknown
}

interface TwitterError {
  code: number
  message: string
  rateLimitInfo?: {
    limit: number
    remaining: number
    reset: number
  }
  dailyLimitInfo?: {
    limit: number
    remaining: number
    reset: number
  }
}

interface TwitterAuth {
  access_token: string
  refresh_token: string
}

// Type for raw DM response before validation
type DMResponse = Record<string, unknown>

export default function TwitterDMsPage() {
  const [supabase] = useState(() => createClient())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<TwitterError | null>(null)
  const [dms, setDms] = useState<TwitterDM[] | null>(null)
  const [twitterAuth, setTwitterAuth] = useState<TwitterAuth | null>(null)

  useEffect(() => {
    async function fetchTwitterAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('twitter_auth')
        .select('access_token, refresh_token')
        .eq('user_id', user.id)
        .single()

      setTwitterAuth(data)
    }

    fetchTwitterAuth()
  }, [supabase])

  const handleFetchDMs = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/dev/twitter/dms')
      if (!response.ok) {
        const errorData = await response.json()
        const headers = errorData.headers || {}
        
        // Check for daily limit first
        if (headers['x-user-limit-24hour-remaining'] === '0') {
          const resetTime = parseInt(headers['x-user-limit-24hour-reset'])
          throw {
            code: 429,
            message: 'Daily DM fetch limit reached',
            dailyLimitInfo: {
              limit: parseInt(headers['x-user-limit-24hour-limit']),
              remaining: 0,
              reset: resetTime
            }
          } as TwitterError
        }
        
        // Then check for regular rate limit
        if (errorData.rateLimitInfo?.remaining === 0) {
          throw {
            code: 429,
            message: 'Twitter API rate limit reached',
            rateLimitInfo: errorData.rateLimitInfo
          } as TwitterError
        }

        // For other errors
        throw {
          code: response.status,
          message: errorData.error?.detail || errorData.message || 'Failed to fetch DMs'
        } as TwitterError
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        console.error('Invalid DMs response:', data)
        throw new Error('Invalid response format')
      }
      
      const isValidDM = (dm: DMResponse): dm is TwitterDM => {
        return typeof dm === 'object' && 
               dm !== null &&
               typeof dm.id === 'string' &&
               typeof dm.text === 'string' &&
               typeof dm.sender_id === 'string' &&
               typeof dm.sender_screen_name === 'string' &&
               typeof dm.created_at === 'string'
      }
      
      if (!data.every(isValidDM)) {
        console.error('Invalid DM object in response:', data)
        throw new Error('Invalid DM format')
      }
      
      setDms(data)
    } catch (err) {
      console.error('Error fetching DMs:', err)
      setError(err as TwitterError)
    } finally {
      setIsLoading(false)
    }
  }

  const isRateLimited = error?.code === 429
  const isDailyLimit = isRateLimited && error?.dailyLimitInfo?.remaining === 0
  const resetTime = isDailyLimit 
    ? fromUnixTime(error.dailyLimitInfo!.reset)
    : error?.rateLimitInfo?.reset 
      ? fromUnixTime(error.rateLimitInfo.reset)
      : null

  const renderDMs = () => {
    if (!Array.isArray(dms)) {
      console.error('DMs is not an array:', dms)
      return null
    }

    return dms.map((dm) => (
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
  }

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent DM Threads</CardTitle>
              <CardDescription>
                Showing the last 10 DM threads from Twitter
              </CardDescription>
            </div>
            <Button 
              onClick={handleFetchDMs} 
              disabled={isLoading || !twitterAuth || isRateLimited}
            >
              {isLoading ? 'Fetching...' : 'Fetch DMs'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant={isRateLimited ? "default" : "destructive"}>
              {isRateLimited ? <AlertTriangle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>
                {isDailyLimit ? 'Daily Limit Reached' : isRateLimited ? 'Rate Limited' : 'Error'}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{isDailyLimit 
                  ? 'You can only fetch DMs once per day. Please try again tomorrow.' 
                  : isRateLimited
                    ? 'Too many requests to Twitter API. Please wait a few minutes and try again.'
                    : error.message}
                </p>
                {resetTime && (
                  <p className="text-sm text-muted-foreground">
                    You can try again at {resetTime.toLocaleString()}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : !dms ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Click the Fetch DMs button to load messages.
              </AlertDescription>
            </Alert>
          ) : dms.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No DM threads found.
              </AlertDescription>
            </Alert>
          ) : (
            renderDMs()
          )}
        </CardContent>
      </Card>
    </div>
  )
} 