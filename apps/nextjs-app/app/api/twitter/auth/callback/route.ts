import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { handleCallback, storeTwitterTokens } from '@/lib/twitter/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return new NextResponse('Missing code or state', { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify state
    const { data: storedState } = await supabase
      .from('auth_states')
      .select()
      .eq('user_id', session.user.id)
      .eq('state', state)
      .single();

    if (!storedState) {
      return new NextResponse('Invalid state', { status: 400 });
    }

    // Clean up used state
    await supabase
      .from('auth_states')
      .delete()
      .eq('user_id', session.user.id)
      .eq('state', state);

    // Exchange code for tokens
    const tokens = await handleCallback(code);

    // Store tokens in database
    await storeTwitterTokens(session.user.id, tokens);

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('Twitter callback error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 