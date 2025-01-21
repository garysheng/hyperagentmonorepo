import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/twitter/auth';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Generate a random state
    const state = Math.random().toString(36).substring(7);

    // Store state in session for verification
    await supabase
      .from('auth_states')
      .insert({
        user_id: session.user.id,
        state,
        created_at: new Date().toISOString(),
      });

    // Generate Twitter auth URL
    const { url } = await generateAuthUrl(state);

    // Redirect to Twitter
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Twitter auth error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 