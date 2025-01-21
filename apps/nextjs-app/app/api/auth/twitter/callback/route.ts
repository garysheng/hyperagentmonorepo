import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { validateCallback } from '@/lib/twitter/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const oauth_token = searchParams.get('oauth_token');
    const oauth_verifier = searchParams.get('oauth_verifier');

    if (!oauth_token || !oauth_verifier) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=Missing Twitter OAuth parameters`
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login`
      );
    }

    // Get the temporary tokens we stored
    const { data: tempTokens } = await supabase
      .from('user_twitter_auth')
      .select('temp_oauth_token_secret')
      .eq('user_id', session.user.id)
      .eq('temp_oauth_token', oauth_token)
      .single();

    if (!tempTokens?.temp_oauth_token_secret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=Invalid OAuth state`
      );
    }

    // Exchange the verifier for access tokens
    const { user, tokens } = await validateCallback(
      oauth_token,
      oauth_verifier,
      tempTokens.temp_oauth_token_secret
    );

    // Store the Twitter tokens and user info
    await supabase
      .from('user_twitter_auth')
      .upsert({
        user_id: session.user.id,
        twitter_id: user.id_str,
        oauth_token: tokens.oauth_token,
        oauth_token_secret: tokens.oauth_token_secret,
        screen_name: user.screen_name,
        updated_at: new Date().toISOString(),
      });

    // Clear temporary tokens
    await supabase
      .from('user_twitter_auth')
      .update({
        temp_oauth_token: null,
        temp_oauth_token_secret: null,
      })
      .eq('user_id', session.user.id);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=Twitter connected successfully`
    );
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=Failed to connect Twitter`
    );
  }
} 