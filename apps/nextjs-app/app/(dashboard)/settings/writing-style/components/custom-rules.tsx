'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { WritingStyle } from '@/types';
import { useState } from 'react';

interface CustomRulesProps {
  writingStyle?: WritingStyle;
  onUpdate: (data: Partial<WritingStyle>) => void;
  isLoading: boolean;
}

interface PhraseInputProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

function PhraseInput({ label, placeholder, values, onChange, disabled }: PhraseInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="mt-1.5"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {value}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleRemove(index)}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {values.length === 0 && (
          <span className="text-sm text-muted-foreground">
            No items added yet. Type and press Enter to add.
          </span>
        )}
      </div>
    </div>
  );
}

export function CustomRules({
  writingStyle,
  onUpdate,
  isLoading
}: CustomRulesProps) {
  const handleUpdate = (key: keyof Pick<WritingStyle, 'preferred_phrases' | 'avoided_phrases' | 'preferred_greetings' | 'preferred_signoffs'>, values: string[]) => {
    onUpdate({ [key]: values });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Phrases & Expressions</h3>
        <div className="space-y-8">
          <PhraseInput
            label="Preferred Phrases"
            placeholder="Add phrases you commonly use..."
            values={writingStyle?.preferred_phrases || []}
            onChange={(values) => handleUpdate('preferred_phrases', values)}
            disabled={isLoading}
          />

          <PhraseInput
            label="Phrases to Avoid"
            placeholder="Add phrases to avoid..."
            values={writingStyle?.avoided_phrases || []}
            onChange={(values) => handleUpdate('avoided_phrases', values)}
            disabled={isLoading}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Greetings & Sign-offs</h3>
        <div className="space-y-8">
          <PhraseInput
            label="Preferred Greetings"
            placeholder="Add your typical greetings..."
            values={writingStyle?.preferred_greetings || []}
            onChange={(values) => handleUpdate('preferred_greetings', values)}
            disabled={isLoading}
          />

          <PhraseInput
            label="Preferred Sign-offs"
            placeholder="Add your typical sign-offs..."
            values={writingStyle?.preferred_signoffs || []}
            onChange={(values) => handleUpdate('preferred_signoffs', values)}
            disabled={isLoading}
          />
        </div>
      </Card>
    </div>
  );
} 