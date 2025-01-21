import { authClient } from './client';
import { TwitterTokens } from '@/types/twitter';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import crypto from 'crypto';

const SCOPES = [
    'tweet.read',
    'users.read',
    'offline.access',
    'dm.read',
    'dm.write',
];

// Generate PKCE challenge pair
function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256')
        .update(verifier)
        .digest('base64url');

    return { verifier, challenge };
}

export async function generateAuthUrl(state: string) {
    const { verifier, challenge } = generatePKCE();

    // Store verifier in Supabase for later use
    const supabase = createClientComponentClient();
    await supabase
        .from('auth_states')
        .update({ code_verifier: verifier, challenge })
        .eq('state', state);

    return authClient.generateOAuth2AuthLink(process.env.TWITTER_CALLBACK_URL!, {
        scope: SCOPES,
        state,
    });
}

export async function handleCallback(code: string, state: string) {
    // Get stored verifier
    const supabase = createClientComponentClient();
    const { data: storedState } = await supabase
        .from('auth_states')
        .select('code_verifier')
        .eq('state', state)
        .single();

    if (!storedState?.code_verifier) {
        throw new Error('No code verifier found');
    }

    const { accessToken, refreshToken, expiresIn } = await authClient.loginWithOAuth2({
        code,
        codeVerifier: storedState.code_verifier,
        redirectUri: process.env.TWITTER_CALLBACK_URL!,
    });

    const tokens: TwitterTokens = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Date.now() + expiresIn * 1000,
    };

    return tokens;
}

export async function storeTwitterTokens(userId: string, tokens: TwitterTokens) {
    const supabase = createClientComponentClient();

    const { error } = await supabase
        .from('twitter_auth')
        .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expires_at,
        });

    if (error) throw error;
}

export async function refreshTokens(userId: string, refreshToken: string): Promise<TwitterTokens> {
    const { accessToken, refreshToken: newRefreshToken, expiresIn } =
        await authClient.refreshOAuth2Token(refreshToken);

    const tokens: TwitterTokens = {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_at: Date.now() + expiresIn * 1000,
    };

    await storeTwitterTokens(userId, tokens);
    return tokens;
} 