import { TwitterApi } from 'twitter-api-v2';
import { REQUIRED_SCOPES } from './auth';

// Create a client for application-only auth (no user context)
export const appOnlyClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

// Create a client with user context using OAuth 2.0 access token
export function getTwitterClient(accessToken: string) {
  return new TwitterApi(accessToken);
}

// Helper to get a client with DM capabilities
export function getDMCapableClient(accessToken: string) {
  const client = getTwitterClient(accessToken);
  return client.v2;
}

// Helper to get a read-write client
export function getReadWriteClient(accessToken: string) {
  const client = getTwitterClient(accessToken);
  return client.v2;
}

// Refresh Twitter access token
export async function refreshTwitterToken(refreshToken: string) {
  try {
    console.log('Attempting to refresh Twitter token...')
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!
    });

    console.log('Refreshing with scopes:', REQUIRED_SCOPES.join(', '))
    const { accessToken, refreshToken: newRefreshToken, expiresIn, scope } = 
      await client.refreshOAuth2Token(refreshToken);

    console.log('Successfully refreshed Twitter token with scopes:', scope)
    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
      scopes: scope
    };
  } catch (error) {
    console.error('Error refreshing Twitter token:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      scopes: REQUIRED_SCOPES
    });
    // Re-throw with more context
    throw new Error('Failed to refresh Twitter token - user needs to reconnect');
  }
} 