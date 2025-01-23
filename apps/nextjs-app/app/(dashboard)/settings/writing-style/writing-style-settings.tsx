'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { VoiceCharacteristics } from './components/voice-characteristics';
import { VoiceExamples } from './components/voice-examples';
import { CustomRules } from './components/custom-rules';
import { PreviewTesting } from './components/preview-testing';
import { useMutation, useQuery } from '@tanstack/react-query';
import { WritingStyle } from '@/types';
import { useCelebrity } from '@/hooks/use-celebrity';

export default function WritingStyleSettings() {
  const [activeTab, setActiveTab] = useState('voice-characteristics');
  const { toast } = useToast();
  const { data: celebrity } = useCelebrity();

  const { data: writingStyle, isLoading } = useQuery({
    queryKey: ['writing-style', celebrity?.id],
    queryFn: async () => {
      const response = await fetch(`/api/writing-style/${celebrity?.id}`);
      if (!response.ok) throw new Error('Failed to fetch writing style');
      return response.json() as Promise<WritingStyle>;
    },
    enabled: !!celebrity?.id
  });

  const updateStyleMutation = useMutation({
    mutationFn: async (data: Partial<WritingStyle>) => {
      const response = await fetch(`/api/writing-style/${celebrity?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update writing style');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'Your writing style settings have been updated.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive'
      });
    }
  });

  return (
    <div className="container max-w-7xl py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Writing Style Settings</h1>
          <p className="text-muted-foreground">
            Customize how your AI assistant communicates across all channels.
          </p>
        </div>
        <Button
          onClick={() => updateStyleMutation.mutate(writingStyle!)}
          disabled={updateStyleMutation.isPending || isLoading}
        >
          {updateStyleMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <Card className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="voice-characteristics">Voice Characteristics</TabsTrigger>
            <TabsTrigger value="voice-examples">Voice Examples</TabsTrigger>
            <TabsTrigger value="custom-rules">Custom Rules</TabsTrigger>
            <TabsTrigger value="preview-testing">Preview & Testing</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="voice-characteristics">
              <VoiceCharacteristics
                writingStyle={writingStyle}
                onUpdate={(data) => updateStyleMutation.mutate(data)}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="voice-examples">
              <VoiceExamples
                writingStyle={writingStyle}
                onUpdate={(data) => updateStyleMutation.mutate(data)}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="custom-rules">
              <CustomRules
                writingStyle={writingStyle}
                onUpdate={(data) => updateStyleMutation.mutate(data)}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="preview-testing">
              <PreviewTesting
                writingStyle={writingStyle}
                isLoading={isLoading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
} 