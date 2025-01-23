'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw } from 'lucide-react';
import { WritingStyle } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PreviewTestingProps {
  writingStyle?: WritingStyle;
  isLoading: boolean;
}

type TestScenario = 'email_business' | 'email_fan' | 'tweet_business' | 'tweet_fan';

const TEST_SCENARIOS = [
  { value: 'email_business', label: 'Business Email' },
  { value: 'email_fan', label: 'Fan Email' },
  { value: 'tweet_business', label: 'Business Tweet' },
  { value: 'tweet_fan', label: 'Fan Tweet' }
];

const SAMPLE_MESSAGES: Record<TestScenario, string> = {
  email_business: 'Hi, I represent a leading tech conference and would like to discuss having you as a keynote speaker.',
  email_fan: 'I\'ve been following your work for years and your insights have really helped me in my career. Would love to connect!',
  tweet_business: '@handle We\'d love to feature you on our podcast about AI and entrepreneurship. DM to discuss?',
  tweet_fan: '@handle Your latest thread on AI safety was mind-blowing! Quick question - what resources would you recommend for getting started?'
};

export function PreviewTesting({
  writingStyle,
  isLoading
}: PreviewTestingProps) {
  const [scenario, setScenario] = useState<TestScenario>('email_business');
  const [customInput, setCustomInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const { toast } = useToast();

  const handleGenerate = async (input: string) => {
    if (!writingStyle) return;

    setIsGenerating(true);
    try {
      console.log('Generating response with:', {
        messageType: scenario.startsWith('email') ? 'email' : 'tweet',
        content: input,
        celebrityId: writingStyle.celebrity_id
      });

      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageType: scenario.startsWith('email') ? 'email' : 'tweet',
          content: input,
          celebrityId: writingStyle.celebrity_id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.error || 'Failed to generate response');
      }

      console.log('Generated response:', data);
      setGeneratedResponse(data.response);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Test Your Writing Style</h3>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Test Scenario</Label>
              <Select
                value={scenario}
                onValueChange={(value: TestScenario) => {
                  setScenario(value);
                  setCustomInput('');
                  setGeneratedResponse('');
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEST_SCENARIOS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>&nbsp;</Label>
              <Button
                onClick={() => handleGenerate(SAMPLE_MESSAGES[scenario])}
                disabled={isLoading || isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Test with Sample
              </Button>
            </div>
          </div>

          <div>
            <Label>Custom Test Message</Label>
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter a custom message to test the response..."
              className="mt-1.5"
              rows={4}
              disabled={isLoading}
            />
            <Button
              onClick={() => handleGenerate(customInput)}
              disabled={isLoading || isGenerating || !customInput.trim()}
              className="mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Response'
              )}
            </Button>
          </div>

          {generatedResponse && (
            <div>
              <Label>Generated Response</Label>
              <Card className="p-4 mt-1.5">
                <p className="whitespace-pre-wrap">{generatedResponse}</p>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 