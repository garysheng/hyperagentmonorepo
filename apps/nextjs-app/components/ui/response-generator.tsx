'use client';

import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGenerateResponse } from '@/hooks/use-generate-response';

interface ResponseGeneratorProps {
  content: string;
  type: 'email' | 'tweet';
  celebrityId: string;
  onResponseGenerated: (response: string) => void;
}

export function ResponseGenerator({
  content,
  type,
  celebrityId,
  onResponseGenerated
}: ResponseGeneratorProps) {
  const { generateResponse, isGenerating, error } = useGenerateResponse();
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      const response = await generateResponse({
        celebrityId,
        content,
        type,
      });
      onResponseGenerated(response);
    } catch (err) {
      console.error('Failed to generate response:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate response. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGenerate}
      disabled={isGenerating || !celebrityId}
    >
      <Wand2 className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Generate Response'}
    </Button>
  );
} 