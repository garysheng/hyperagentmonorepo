import { TweetV1, DirectMessageCreateV1, UserV1 } from 'twitter-api-v2';

export interface TwitterTokens {
  oauth_token: string;
  oauth_token_secret: string;
}

export interface TwitterUser extends UserV1 {
  tokens?: TwitterTokens;
}

export interface TwitterDM extends DirectMessageCreateV1 {
  id: string;
  created_at: string;
  sender: TwitterUser;
  recipient: TwitterUser;
}

export interface TwitterAuthState {
  isAuthenticated: boolean;
  user?: TwitterUser;
  error?: string;
} 