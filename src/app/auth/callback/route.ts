import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .single();

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
