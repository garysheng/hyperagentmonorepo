// Use CommonJS require to avoid ESM initialization issues
const { TwitterApi } = require('twitter-api-v2');

// Factory functions to create clients on demand instead of at module initialization
export const getReadOnlyClient = () => {
  return new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
};

export const getAuthClient = () => {
  return new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  });
};

export const createUserClient = (accessToken: string) => {
  return new TwitterApi(accessToken);
}; 