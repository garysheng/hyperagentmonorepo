'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { WritingStyle, VoiceExample, VoiceExampleContext } from '@/types';

interface VoiceExamplesProps {
  writingStyle?: WritingStyle;
  onUpdate: (data: Partial<WritingStyle>) => void;
  isLoading: boolean;
}

const CONTEXT_OPTIONS: { label: string; value: VoiceExampleContext }[] = [
  { label: 'Professional Communication', value: 'professional' },
  { label: 'Fan Interaction', value: 'fan' },
  { label: 'Business Inquiry', value: 'business' },
  { label: 'Casual Conversation', value: 'casual' }
];

export function VoiceExamples({
  writingStyle,
  onUpdate,
  isLoading
}: VoiceExamplesProps) {
  const examples = writingStyle?.voice_examples || [];

  const handleAddExample = () => {
    const newExample: VoiceExample = {
      context: 'professional',
      content: ''
    };
    onUpdate({
      voice_examples: [...examples, newExample]
    });
  };

  const handleRemoveExample = (index: number) => {
    const newExamples = examples.filter((_, i) => i !== index);
    onUpdate({ voice_examples: newExamples });
  };

  const handleExampleChange = (index: number, field: keyof VoiceExample, value: string) => {
    const newExamples = examples.map((example, i) => {
      if (i === index) {
        return {
          ...example,
          [field]: field === 'context' ? value as VoiceExampleContext : value
        };
      }
      return example;
    });
    onUpdate({ voice_examples: newExamples });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Voice Examples</h3>
            <p className="text-sm text-muted-foreground">
              Add examples of messages that represent your authentic voice in different contexts.
            </p>
          </div>
          <Button
            onClick={handleAddExample}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Example
          </Button>
        </div>

        <div className="space-y-6">
          {examples.map((example, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <div>
                    <Label>Context</Label>
                    <Select
                      value={example.context}
                      onValueChange={(value) => handleExampleChange(index, 'context', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTEXT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Message Example</Label>
                    <Textarea
                      value={example.content}
                      onChange={(e) => handleExampleChange(index, 'content', e.target.value)}
                      placeholder="Enter a message that represents your voice..."
                      className="mt-1.5"
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveExample(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {examples.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No examples added yet. Click &quot;Add Example&quot; to get started.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 