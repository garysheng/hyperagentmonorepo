'use client'

import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TwitterAuthState } from '@/types/twitter'

interface TwitterAuthData {
  twitter_id: string
  screen_name: string
  oauth_token: string
  oauth_token_secret: string
}

export function useTwitterAuth() {
  const supabase = createClientComponentClient()

  const { data: authState, isLoading } = useQuery({
    queryKey: ['twitter-auth'],
    queryFn: async (): Promise<TwitterAuthState> => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return { isAuthenticated: false }
      }

      const { data: twitterAuth } = await supabase
        .from('user_twitter_auth')
        .select('twitter_id, screen_name, oauth_token, oauth_token_secret')
        .eq('user_id', session.user.id)
        .single()

      if (!twitterAuth?.oauth_token || !twitterAuth?.oauth_token_secret) {
        return { isAuthenticated: false }
      }

      const auth = twitterAuth as TwitterAuthData

      return {
        isAuthenticated: true,
        user: {
          id_str: auth.twitter_id,
          screen_name: auth.screen_name,
          tokens: {
            oauth_token: auth.oauth_token,
            oauth_token_secret: auth.oauth_token_secret,
          },
        },
      }
    },
  })

  return {
    isLoading,
    isAuthenticated: authState?.isAuthenticated ?? false,
    twitterId: authState?.user?.id_str,
    screenName: authState?.user?.screen_name,
    tokens: authState?.user?.tokens,
  }
} 