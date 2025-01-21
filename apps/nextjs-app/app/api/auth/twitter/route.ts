import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthLink } from '@/lib/twitter/auth';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get Twitter auth link and temporary tokens
    const { url, tokens } = await getAuthLink();

    // Store temporary tokens in session
    await supabase
      .from('user_twitter_auth')
      .upsert({
        user_id: session.user.id,
        temp_oauth_token: tokens.oauth_token,
        temp_oauth_token_secret: tokens.oauth_token_secret,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Twitter auth' },
      { status: 500 }
    );
  }
} 