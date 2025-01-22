import { TweetV1, DirectMessageCreateV1 } from 'twitter-api-v2';

export interface TwitterTokens {
  access_token: string
  refresh_token?: string
}

export interface TwitterUserMinimal {
  id_str: string;
  screen_name: string;
  tokens?: TwitterTokens;
}

export interface TwitterDM extends DirectMessageCreateV1 {
  id: string;
  created_at: string;
  sender: TwitterUserMinimal;
  recipient: TwitterUserMinimal;
}

export interface TwitterAuthState {
  isAuthenticated: boolean;
  user?: TwitterUserMinimal;
  error?: string;
} 