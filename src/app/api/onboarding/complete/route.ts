import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated via their session cookie
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['student', 'teacher'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const meta = user.user_metadata || {};

    // Use service role client to bypass RLS for profile creation
    const adminClient = createServiceClient();
    const { error } = await adminClient
      .from('profiles')
      .upsert({
        id: user.id,
        first_name: meta.given_name || meta.full_name?.split(' ')[0] || '',
        last_name: meta.family_name || meta.full_name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        role,
        status: 'active',
      }, { onConflict: 'id' });

    if (error) {
      console.error('Profile upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Onboarding API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
