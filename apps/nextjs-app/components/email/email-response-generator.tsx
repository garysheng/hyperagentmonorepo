'use client';

import { ResponseGenerator } from '../ui/response-generator';

interface EmailResponseGeneratorProps {
  content: string;
  celebrityId: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  onResponseGenerated?: (response: string) => void;
  className?: string;
}

export function EmailResponseGenerator({
  content,
  celebrityId,
  previousMessages,
  onResponseGenerated,
  className
}: EmailResponseGeneratorProps) {
  return (
    <ResponseGenerator
      type="email"
      content={content}
      celebrityId={celebrityId}
      previousMessages={previousMessages}
      onResponseGenerated={onResponseGenerated}
      className={className}
    />
  );
} 