export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getAuthLink } from '@/lib/twitter/auth';
import { cookies } from 'next/headers';

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

    // Get Twitter auth link with state and code verifier
    const { url, tokens } = await getAuthLink();
    console.log('Generated tokens:', tokens);

    // Store code verifier in an HTTP-only cookie
    const response = NextResponse.json({ url: `${url}&state=${tokens.state}` });
    response.cookies.set('twitter_code_verifier', tokens.code_verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5 // 5 minutes
    });
    
    return response;
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Twitter auth' },
      { status: 500 }
    );
  }
} 