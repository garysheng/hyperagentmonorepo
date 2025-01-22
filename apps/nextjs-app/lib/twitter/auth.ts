import { TwitterApi } from 'twitter-api-v2';
import { TwitterTokens } from '@/types/twitter';

// Initialize the client for OAuth 2.0
const client = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
});

export async function getAuthLink() {
  const { url, state, codeVerifier } = client.generateOAuth2AuthLink(
    process.env.TWITTER_CALLBACK_URL!,
    { 
      scope: [
        'tweet.read',
        'users.read',
        'dm.read',
        'offline.access'
      ] 
    }
  );

  return {
    url,
    tokens: {
      state,
      code_verifier: codeVerifier,
    },
  };
}

export async function validateCallback(
  code: string,
  state: string,
  storedState: string,
  codeVerifier: string,
) {
  if (state !== storedState) {
    throw new Error('Stored tokens do not match.');
  }

  const { client: loggedClient, accessToken, refreshToken } =
    await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: process.env.TWITTER_CALLBACK_URL!,
    });

  // Get the user details
  const user = await loggedClient.v2.me();

  return {
    user: user.data,
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken,
    } as TwitterTokens,
  };
} 