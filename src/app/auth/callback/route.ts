import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Check user role to redirect appropriately
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const roleParam = requestUrl.searchParams.get('role');
        const validRoles = ['student', 'teacher', 'school_admin'];
        const selectedRole = roleParam && validRoles.includes(roleParam) ? roleParam : null;

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .single();

        if (selectedRole) {
          // If a role was selected during registration, set/update profile automatically
          if (!profile || profile.status === 'pending') {
            const meta = user.user_metadata || {};
            const rawFirst =
              meta.given_name ||
              meta.first_name ||
              meta.full_name?.split(' ')[0] ||
              meta.name?.split(' ')[0] ||
              user.email?.split('@')[0] ||
              'User';

            const rawLast =
              meta.family_name ||
              meta.last_name ||
              meta.full_name?.split(' ').slice(1).join(' ') ||
              meta.name?.split(' ').slice(1).join(' ') ||
              '';

            const firstName = rawFirst.trim() || 'User';
            const lastName = rawLast.trim();

            const adminClient = createServiceClient();
            const { error: upsertError } = await adminClient
              .from('profiles')
              .upsert({
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                email: user.email,
                role: selectedRole,
                status: 'active',
              }, { onConflict: 'id' });

            if (!upsertError) {
              const targetDashboard = selectedRole === 'school_admin' ? '/dashboard/admin' : `/dashboard/${selectedRole}`;
              return NextResponse.redirect(new URL(targetDashboard, request.url));
            } else {
              console.error('Callback profile upsert error:', upsertError);
            }
          }
        }

        if (profile) {
          if (profile.status === 'pending') {
            return NextResponse.redirect(new URL('/onboarding', request.url));
          } else if (profile.role === 'teacher') {
            return NextResponse.redirect(new URL('/dashboard/teacher', request.url));
          } else if (profile.role === 'student') {
            return NextResponse.redirect(new URL('/dashboard/student', request.url));
          } else if (profile.role === 'school_admin' || profile.role === 'it_admin') {
            return NextResponse.redirect(new URL('/dashboard/admin', request.url));
          }
        }
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  // Redirect to login page with error if code exchange fails
  return NextResponse.redirect(new URL('/login?error=auth-code-error', requestUrl.origin));
}
