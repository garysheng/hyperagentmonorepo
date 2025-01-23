'use client';

import { useState } from 'react';
import { Card } from './card';
import { Button } from './button';
import { Textarea } from './textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ResponseGeneratorProps {
  type: 'email' | 'tweet';
  content: string;
  celebrityId: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  onResponseGenerated?: (response: string) => void;
  className?: string;
}

export function ResponseGenerator({
  type,
  content,
  celebrityId,
  previousMessages,
  onResponseGenerated,
  className
}: ResponseGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const { toast } = useToast();

  const generateResponse = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageType: type,
          content,
          celebrityId,
          previousMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      setGeneratedResponse(data.response);
      onResponseGenerated?.(data.response);
    } catch (err) {
      console.error('Error generating response:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Generate {type === 'email' ? 'Email' : 'Tweet'} Response
          </h3>
          <Button
            onClick={generateResponse}
            disabled={isGenerating}
            className="w-[140px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
        
        {generatedResponse && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Generated Response:</label>
            <Textarea
              value={generatedResponse}
              onChange={(e) => setGeneratedResponse(e.target.value)}
              className="min-h-[150px]"
              placeholder="Generated response will appear here..."
            />
          </div>
        )}
      </div>
    </Card>
  );
} 