export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getAuthLink } from '@/lib/twitter/auth';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get Twitter auth link and temporary tokens
    const { url, tokens } = await getAuthLink();
    console.log('Generated tokens:', tokens);

    // Store tokens in twitter_auth table
    const { error: upsertError } = await supabase
      .from('twitter_auth')
      .upsert({
        user_id: user.id,
        access_token: tokens.oauth_token,
        refresh_token: tokens.oauth_token_secret,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Error storing tokens:', upsertError);
      return NextResponse.json(
        { error: 'Failed to store tokens' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Twitter auth' },
      { status: 500 }
    );
  }
} 