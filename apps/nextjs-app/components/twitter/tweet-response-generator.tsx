'use client';

import { ResponseGenerator } from '../ui/response-generator';

interface TweetResponseGeneratorProps {
  content: string;
  celebrityId: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  onResponseGenerated?: (response: string) => void;
  className?: string;
}

export function TweetResponseGenerator({
  content,
  celebrityId,
  previousMessages,
  onResponseGenerated,
  className
}: TweetResponseGeneratorProps) {
  return (
    <ResponseGenerator
      type="tweet"
      content={content}
      celebrityId={celebrityId}
      previousMessages={previousMessages}
      onResponseGenerated={onResponseGenerated}
      className={className}
    />
  );
} 