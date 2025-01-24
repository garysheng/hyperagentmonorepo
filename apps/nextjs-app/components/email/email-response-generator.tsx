'use client';

import { ResponseGenerator } from '../ui/response-generator';

interface EmailResponseGeneratorProps {
  content: string;
  celebrityId: string;
  onResponseGenerated: (response: string) => void;
}

export function EmailResponseGenerator({
  content,
  celebrityId,
  onResponseGenerated
}: EmailResponseGeneratorProps) {
  return (
    <ResponseGenerator
      type="email"
      content={content}
      celebrityId={celebrityId}
      onResponseGenerated={onResponseGenerated}
    />
  );
} 