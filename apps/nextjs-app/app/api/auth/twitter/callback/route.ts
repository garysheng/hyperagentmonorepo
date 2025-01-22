import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateCallback } from '@/lib/twitter/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const oauth_token = searchParams.get('oauth_token');
    const oauth_verifier = searchParams.get('oauth_verifier');
    console.log('Received tokens:', { oauth_token, oauth_verifier });

    if (!oauth_token || !oauth_verifier) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Missing Twitter OAuth parameters`
      );
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('Auth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login`
      );
    }

    console.log('Looking up tokens for user:', user.id);

    // Get the stored tokens
    const { data: storedTokens, error: lookupError } = await supabase
      .from('twitter_auth')
      .select('refresh_token')
      .eq('user_id', user.id)
      .single();

    if (lookupError) {
      console.error('Error looking up tokens:', lookupError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Failed to retrieve stored tokens`
      );
    }

    if (!storedTokens?.refresh_token) {
      console.log('No matching tokens found:', { storedTokens });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Invalid OAuth state`
      );
    }

    console.log('Found stored tokens:', storedTokens);

    // Exchange the verifier for access tokens
    const { user: twitterUser, tokens } = await validateCallback(
      oauth_token,
      oauth_verifier,
      storedTokens.refresh_token
    );

    console.log('Validated Twitter tokens:', { tokens, screenName: twitterUser.screen_name });

    // Update the Twitter tokens
    const { error: updateError } = await supabase
      .from('twitter_auth')
      .update({
        access_token: tokens.oauth_token,
        refresh_token: tokens.oauth_token_secret,
        screen_name: twitterUser.screen_name,
        twitter_id: twitterUser.id_str,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating tokens:', updateError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Failed to store Twitter credentials`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/channels?success=Twitter connected successfully`
    );
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Failed to connect Twitter`
    );
  }
} 