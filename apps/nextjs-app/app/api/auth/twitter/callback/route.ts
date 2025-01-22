import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateCallback } from '@/lib/twitter/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('Received callback params:', { code, state });

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Missing OAuth parameters`
      );
    }

    // Get code verifier from cookie
    const codeVerifier = request.cookies.get('twitter_code_verifier')?.value;
    
    if (!codeVerifier) {
      console.error('Missing code verifier cookie');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Missing code verifier`
      );
    }

    console.log('Found code verifier:', { codeVerifier });

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('Auth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login`
      );
    }

    console.log('Exchanging code for tokens...');

    // Exchange the code for access token
    const { user: twitterUser, tokens } = await validateCallback(
      code,
      state,
      state, // Original state is the same since we're not storing it
      codeVerifier
    );

    console.log('Received tokens from Twitter:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      screenName: twitterUser.username
    });

    // Store the final tokens
    const { error: updateError } = await supabase
      .from('twitter_auth')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        screen_name: twitterUser.username,
        twitter_id: twitterUser.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating tokens:', updateError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Failed to store Twitter credentials`
      );
    }

    console.log('Successfully stored tokens in database');

    // Clear the code verifier cookie
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/channels?success=Twitter connected successfully`
    );
    response.cookies.delete('twitter_code_verifier');
    return response;
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=Failed to connect Twitter`
    );
  }
} 