import axios from 'axios';

export interface UserProfile {
  summary: string;
  followers?: {
    twitter?: number;
    instagram?: number;
    tiktok?: number;
  };
  error?: string;
}

export async function fetchUserProfile(handle: string): Promise<UserProfile> {
  try {
    const prompt = `Research the social media presence of ${handle} (without @ symbol). 
    Provide a brief summary of who they are and their follower counts on Twitter/X, Instagram, and TikTok if available. 
    Focus on their professional background, influence, and any notable achievements.`;

    const response = await axios.post(
      'https://api.perplexity.ai/v1/chat/completions',
      {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that researches social media profiles and provides structured information about users.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`
        }
      }
    );

    if (response.data && response.data.text) {
      return {
        summary: response.data.text,
        // Note: In a real implementation, we'd parse the response to extract follower counts
        // This is a placeholder structure
        followers: {
          twitter: undefined,
          instagram: undefined,
          tiktok: undefined
        }
      };
    }

    return {
      summary: '',
      error: 'No data returned from Perplexity'
    };
  } catch (error) {
    return {
      summary: '',
      error: String(error)
    };
  }
} 