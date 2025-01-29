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
    <div className="container max-w-7xl py-6 pl-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Writing Style Settings</h1>
          <p className="text-muted-foreground">
            Customize how your AI assistant communicates across all channels.
          </p>
        </div>
        <Button
          onClick={() => updateStyleMutation.mutate(writingStyle!)}
          disabled={updateStyleMutation.isPending || isLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
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

      <Card className="mt-8 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-br after:from-purple-500/5 after:to-pink-500/5 after:opacity-50 after:-z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <TabsTrigger 
              value="voice-characteristics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-500"
            >
              Voice Characteristics
            </TabsTrigger>
            <TabsTrigger 
              value="voice-examples"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-500"
            >
              Voice Examples
            </TabsTrigger>
            <TabsTrigger 
              value="custom-rules"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-500"
            >
              Custom Rules
            </TabsTrigger>
            <TabsTrigger 
              value="preview-testing"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-500"
            >
              Preview & Testing
            </TabsTrigger>
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