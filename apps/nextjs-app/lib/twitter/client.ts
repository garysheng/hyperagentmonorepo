import { TwitterApi } from 'twitter-api-v2';

// Create a client with read-only access
export const readOnlyClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

// Create a client for OAuth2 flow
export const authClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
});

// Helper to create a client with user context
export const createUserClient = (accessToken: string) => {
  return new TwitterApi(accessToken);
}; 