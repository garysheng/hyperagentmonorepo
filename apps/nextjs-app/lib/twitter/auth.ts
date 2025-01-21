import { TwitterApi } from 'twitter-api-v2';
import { TwitterTokens } from '@/types/twitter';

// Initialize the client for OAuth 1.0a
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
});

export async function getAuthLink() {
  const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(
    process.env.TWITTER_CALLBACK_URL!,
    { linkMode: 'authorize' }
  );

  return {
    url,
    tokens: {
      oauth_token,
      oauth_token_secret,
    },
  };
}

export async function validateCallback(
  oauth_token: string,
  oauth_verifier: string,
  oauth_token_secret: string
) {
  const tempClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  });

  const { client: loggedClient, accessToken, accessSecret } =
    await tempClient.login(oauth_verifier);

  // Get the user details
  const user = await loggedClient.currentUser();

  return {
    user,
    tokens: {
      oauth_token: accessToken,
      oauth_token_secret: accessSecret,
    } as TwitterTokens,
  };
} 