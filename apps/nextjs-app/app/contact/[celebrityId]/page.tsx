'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HyperAgentWidget } from '@/lib/widget-dev';
import { useParams } from 'next/navigation';

interface Celebrity {
  id: string;
  name: string;
  bio?: string;
  profile_image_url?: string;
}

export default function ContactPage() {
  const params = useParams();
  const celebrityId = params.celebrityId as string;
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCelebrity() {
      try {
        const response = await fetch(`/api/celebrities/${celebrityId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch celebrity');
        }
        const data = await response.json();
        setCelebrity(data.celebrity);
        setError(null);
      } catch (error) {
        console.error('Error fetching celebrity:', error);
        setError(error instanceof Error ? error.message : 'Failed to load celebrity information');
      } finally {
        setLoading(false);
      }
    }

    if (celebrityId) {
      fetchCelebrity();
    }
  }, [celebrityId]);

  useEffect(() => {
    if (!celebrityId) return;

    // Initialize widget with the celebrity ID from the URL
    const widget = new HyperAgentWidget({
      celebrityId,
    });
  }, [celebrityId]);

  if (!celebrityId) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No celebrity ID provided. Please check the URL and try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we fetch the celebrity information.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !celebrity) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Celebrity not found'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-6">
            {celebrity.profile_image_url && (
              <img 
                src={celebrity.profile_image_url} 
                alt={celebrity.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div>
              <CardTitle className="text-3xl">{celebrity.name}</CardTitle>
              {celebrity.bio && (
                <CardDescription className="mt-2 text-base">
                  {celebrity.bio}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Propose an Opportunity</CardTitle>
          <CardDescription className="text-base">
            This is the official channel to propose business opportunities, collaborations, or partnerships 
            with {celebrity.name}. Our team reviews all proposals and will get back to 
            you if there's a potential fit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">How it works:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Click the chat bubble in the bottom right corner</li>
              <li>Enter your email address to start the conversation</li>
              <li>Review the current goals and opportunities being sought</li>
              <li>Describe your proposal in detail</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Please note: This is a curated channel for serious business inquiries only. For fan mail or general 
            inquiries, please use the appropriate social media channels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 