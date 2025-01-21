import { TwitterApi } from 'twitter-api-v2';

// Create a client for application-only auth (no user context)
export const appOnlyClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

// Create an OAuth 1.0a client
export function getReadWriteClient(token: string, secret: string) {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: token,
    accessSecret: secret,
  });
}

// Helper to get a client with DM permissions
export function getDMCapableClient(token: string, secret: string) {
  const client = getReadWriteClient(token, secret);
  return client.readWrite.v1;
} 