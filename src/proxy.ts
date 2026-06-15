import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const nextUrl = request.nextUrl.clone();

  // If user is accessing dashboard/onboarding and not logged in, redirect to login
  if (!user && (nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/onboarding'))) {
    nextUrl.pathname = '/login';
    return NextResponse.redirect(nextUrl);
  }

  // If user is logged in and trying to access auth pages, redirect to their dashboard
  if (user && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register' || nextUrl.pathname === '/')) {
    // Fetch user profile from public.profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (profile.status === 'pending') {
        nextUrl.pathname = '/onboarding';
      } else if (profile.role === 'teacher') {
        nextUrl.pathname = '/dashboard/teacher';
      } else if (profile.role === 'student') {
        nextUrl.pathname = '/dashboard/student';
      } else if (profile.role === 'school_admin' || profile.role === 'it_admin') {
        nextUrl.pathname = '/dashboard/admin';
      } else {
        nextUrl.pathname = '/onboarding';
      }
      return NextResponse.redirect(nextUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
