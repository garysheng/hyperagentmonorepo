import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type Props = {
    params: Promise<{
        celebrityId: string;
    }>;
};

export async function GET(
    req: NextRequest,
    { params }: Props
) {
    const { celebrityId } = await params;
    if (!celebrityId) {
        return NextResponse.json(
            { error: 'Celebrity ID is required' },
            { status: 400 }
        );
    }

    try {
        const supabase = await createClient();

        const { data: celebrity, error } = await supabase
            .from('celebrities')
            .select('id, celebrity_name')
            .eq('id', celebrityId)
            .single();

        if (error) {
            console.error('Error fetching celebrity:', error);
            return NextResponse.json(
                { error: 'Failed to fetch celebrity' },
                { status: 500 }
            );
        }

        if (!celebrity) {
            return NextResponse.json(
                { error: 'Celebrity not found' },
                { status: 404 }
            );
        }

        // Transform the data to match our interface
        const transformedCelebrity = {
            id: celebrity.id,
            name: celebrity.celebrity_name,
            // These fields don't exist in the database yet
            bio: null,
            profile_image_url: null
        };

        return NextResponse.json({ celebrity: transformedCelebrity });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 