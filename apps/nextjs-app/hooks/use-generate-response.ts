import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface GenerateResponseOptions {
  celebrityId: string;
  content: string;
  type: 'email' | 'tweet';
  threadId?: string;
}

export function useGenerateResponse() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async ({ celebrityId, content, type, threadId }: GenerateResponseOptions) => {
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageType: type,
          content,
          celebrityId,
          threadId,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate response');
        } else {
          const textError = await response.text();
          throw new Error(textError.substring(0, 200));
        }
      }

      const data = await response.json();
      return data.response as string;
    },
    onMutate: () => {
      setIsGenerating(true);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const generateResponse = async (options: GenerateResponseOptions) => {
    return generateMutation.mutateAsync(options);
  };

  return {
    generateResponse,
    isGenerating,
    error: generateMutation.error,
  };
} 