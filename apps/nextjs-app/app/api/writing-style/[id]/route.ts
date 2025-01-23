import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { TableName, WritingStyle } from '@/types';

const DEFAULT_WRITING_STYLE: Partial<WritingStyle> = {
  formality_level: 50,
  enthusiasm_level: 50,
  directness_level: 50,
  humor_level: 30,
  sentence_length_preference: 50,
  vocabulary_complexity: 50,
  technical_language_level: 30,
  emoji_usage_level: 20,
  preferred_phrases: [],
  avoided_phrases: [],
  preferred_greetings: [],
  preferred_signoffs: [],
  voice_examples: []
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const supabase = await createClient();

    // Get writing style by ID
    const { data: writingStyle, error } = await supabase
      .from(TableName.WRITING_STYLES)
      .select('*')
      .eq('celebrity_id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching writing style:', error);
      return NextResponse.json(
        { error: 'Failed to fetch writing style' },
        { status: 500 }
      );
    }

    if (!writingStyle) {
      // Initialize writing style for the celebrity
      const { data: newWritingStyle, error: insertError } = await supabase
        .from(TableName.WRITING_STYLES)
        .insert({
          celebrity_id: id,
          ...DEFAULT_WRITING_STYLE
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error creating writing style:', insertError);
        return NextResponse.json(
          { error: 'Failed to create writing style' },
          { status: 500 }
        );
      }

      return NextResponse.json(newWritingStyle);
    }

    return NextResponse.json(writingStyle);
  } catch (error) {
    console.error('Error in writing style endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 