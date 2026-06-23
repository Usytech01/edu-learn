import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classCode } = body;

    if (!classCode || typeof classCode !== 'string' || classCode.trim().length !== 8) {
      return NextResponse.json({ error: 'Invalid class code format. Must be an 8-character code.' }, { status: 400 });
    }

    const cleanCode = classCode.trim().toUpperCase();
    const adminClient = createServiceClient();

    // 1. Fetch Class
    const { data: classData, error: classError } = await adminClient
      .from('classes')
      .select('id, name, institution_id')
      .eq('class_code', cleanCode)
      .maybeSingle();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found. Please double-check the code.' }, { status: 404 });
    }

    // 2. Fetch User Profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, institution_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Failed to retrieve user profile.' }, { status: 500 });
    }

    if (profile.role !== 'student') {
      return NextResponse.json({ error: 'Only students can join classes.' }, { status: 403 });
    }

    // 3. Multi-tenant security check: Ensure student matches class's institution
    if (profile.institution_id && profile.institution_id !== classData.institution_id) {
      return NextResponse.json({
        error: 'This class belongs to another institution. You cannot join classes outside your institution.'
      }, { status: 400 });
    }

    // 4. If student doesn't have an institution_id, associate them with this class's institution
    if (!profile.institution_id) {
      const { error: updateProfileError } = await adminClient
        .from('profiles')
        .update({ institution_id: classData.institution_id })
        .eq('id', user.id);

      if (updateProfileError) {
        console.error('Failed to update student institution profile:', updateProfileError);
      }
    }

    // 5. Check existing enrollment
    const { data: existingEnrollment, error: checkEnrollmentError } = await adminClient
      .from('enrollments')
      .select('id, status')
      .eq('student_id', user.id)
      .eq('class_id', classData.id)
      .maybeSingle();

    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        return NextResponse.json({ error: 'You are already enrolled in this class.' }, { status: 400 });
      } else {
        // Reactivate enrollment
        const { error: reactivateError } = await adminClient
          .from('enrollments')
          .update({ status: 'active', enrolled_at: new Date().toISOString() })
          .eq('id', existingEnrollment.id);

        if (reactivateError) {
          return NextResponse.json({ error: 'Failed to reactivate enrollment.' }, { status: 500 });
        }
        return NextResponse.json({ success: true, className: classData.name });
      }
    }

    // 6. Create enrollment
    const { error: enrollError } = await adminClient
      .from('enrollments')
      .insert({
        student_id: user.id,
        class_id: classData.id,
        status: 'active'
      });

    if (enrollError) {
      console.error('Enrollment insert error:', enrollError);
      return NextResponse.json({ error: 'Failed to join class.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, className: classData.name });
  } catch (err: any) {
    console.error('Class join API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
