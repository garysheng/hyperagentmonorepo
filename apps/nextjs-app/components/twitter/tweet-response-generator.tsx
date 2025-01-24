'use client';

import { ResponseGenerator } from '../ui/response-generator';

interface TweetResponseGeneratorProps {
  content: string;
  celebrityId: string;
  onResponseGenerated: (response: string) => void;
}

export function TweetResponseGenerator({
  content,
  celebrityId,
  onResponseGenerated
}: TweetResponseGeneratorProps) {
  return (
    <ResponseGenerator
      type="tweet"
      content={content}
      celebrityId={celebrityId}
      onResponseGenerated={onResponseGenerated}
    />
  );
} 