'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { WritingStyle } from '@/types';

interface VoiceCharacteristicsProps {
  writingStyle?: WritingStyle;
  onUpdate: (data: Partial<WritingStyle>) => void;
  isLoading: boolean;
}

interface SliderConfig {
  label: string;
  key: keyof Pick<WritingStyle, 
    'formality_level' | 
    'enthusiasm_level' | 
    'directness_level' | 
    'humor_level' | 
    'sentence_length_preference' | 
    'vocabulary_complexity' | 
    'technical_language_level' | 
    'emoji_usage_level'
  >;
  leftLabel: string;
  rightLabel: string;
}

const TONE_SLIDERS: SliderConfig[] = [
  {
    label: 'Formality',
    key: 'formality_level',
    leftLabel: 'Very Casual',
    rightLabel: 'Very Formal'
  },
  {
    label: 'Enthusiasm',
    key: 'enthusiasm_level',
    leftLabel: 'Reserved',
    rightLabel: 'Enthusiastic'
  },
  {
    label: 'Directness',
    key: 'directness_level',
    leftLabel: 'Diplomatic',
    rightLabel: 'Direct'
  },
  {
    label: 'Humor',
    key: 'humor_level',
    leftLabel: 'Serious',
    rightLabel: 'Playful'
  }
];

const STYLE_SLIDERS: SliderConfig[] = [
  {
    label: 'Sentence Length',
    key: 'sentence_length_preference',
    leftLabel: 'Concise',
    rightLabel: 'Elaborate'
  },
  {
    label: 'Vocabulary',
    key: 'vocabulary_complexity',
    leftLabel: 'Simple',
    rightLabel: 'Sophisticated'
  },
  {
    label: 'Technical Language',
    key: 'technical_language_level',
    leftLabel: 'Avoid',
    rightLabel: 'Embrace'
  },
  {
    label: 'Emoji Usage',
    key: 'emoji_usage_level',
    leftLabel: 'Never',
    rightLabel: 'Frequent'
  }
];

export function VoiceCharacteristics({
  writingStyle,
  onUpdate,
  isLoading
}: VoiceCharacteristicsProps) {
  const handleSliderChange = (key: SliderConfig['key'], value: number[]) => {
    onUpdate({ [key]: value[0] });
  };

  const renderSlider = (config: SliderConfig) => {
    const value = writingStyle?.[config.key] ?? 50;

    return (
      <div key={config.key} className="space-y-2">
        <div className="flex justify-between">
          <Label>{config.label}</Label>
          <span className="text-sm text-muted-foreground">{value}%</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-24">{config.leftLabel}</span>
          <Slider
            value={[value]}
            onValueChange={(value) => handleSliderChange(config.key, value)}
            min={0}
            max={100}
            step={1}
            disabled={isLoading}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-24 text-right">{config.rightLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tone Settings</h3>
        <div className="space-y-6">
          {TONE_SLIDERS.map(renderSlider)}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Writing Style</h3>
        <div className="space-y-6">
          {STYLE_SLIDERS.map(renderSlider)}
        </div>
      </Card>
    </div>
  );
} 