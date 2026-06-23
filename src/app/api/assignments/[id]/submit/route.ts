import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createServiceClient();

    // 1. Fetch Assignment
    const { data: assignment, error: assignmentError } = await adminClient
      .from('assignments')
      .select('id, class_id, type, points, due_date, status')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
    }

    if (assignment.status !== 'published') {
      return NextResponse.json({ error: 'This assignment is not open for submissions.' }, { status: 400 });
    }

    // 2. Fetch User Profile & Enrollment Verification
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Only students can submit assignments.' }, { status: 403 });
    }

    const { data: enrollment, error: enrollError } = await adminClient
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('class_id', assignment.class_id)
      .eq('status', 'active')
      .maybeSingle();

    if (enrollError || !enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in the class for this assignment.' }, { status: 403 });
    }

    // 3. Determine if late
    const isLate = assignment.due_date ? new Date() > new Date(assignment.due_date) : false;

    // 4. Create/Upsert Submission
    const isQuiz = assignment.type === 'quiz';
    const subStatus = isQuiz ? 'graded' : 'submitted';

    const { data: submission, error: subError } = await adminClient
      .from('submissions')
      .upsert({
        assignment_id: assignmentId,
        student_id: user.id,
        submitted_at: new Date().toISOString(),
        is_late: isLate,
        status: subStatus,
        content: isQuiz ? 'Quiz Answers Submitted' : (body.content || null),
        file_url: isQuiz ? null : (body.fileUrl || null)
      }, { onConflict: 'assignment_id,student_id' })
      .select()
      .single();

    if (subError || !submission) {
      console.error('Submission error:', subError);
      return NextResponse.json({ error: 'Failed to record submission.' }, { status: 500 });
    }

    // 5. If it is a quiz, perform auto-grading
    if (isQuiz) {
      const studentAnswers = body.answers || {}; // question_id -> chosen_answer string
      
      const { data: questions, error: questionsError } = await adminClient
        .from('quiz_questions')
        .select('id, correct_answer, points')
        .eq('assignment_id', assignmentId);

      if (questionsError || !questions) {
        console.error('Questions fetch error:', questionsError);
        return NextResponse.json({ error: 'Failed to fetch quiz questions for grading.' }, { status: 500 });
      }

      let totalMaxPoints = 0;
      let totalPointsEarned = 0;
      let correctCount = 0;

      // Grade each question and insert quiz_answers
      for (const q of questions) {
        const studentAns = studentAnswers[q.id];
        const isCorrect = String(studentAns || '').trim().toLowerCase() === String(q.correct_answer || '').trim().toLowerCase();
        const pointsEarned = isCorrect ? Number(q.points) : 0;
        
        totalMaxPoints += Number(q.points);
        totalPointsEarned += pointsEarned;
        if (isCorrect) correctCount++;

        const { error: ansError } = await adminClient
          .from('quiz_answers')
          .upsert({
            submission_id: submission.id,
            question_id: q.id,
            answer: studentAns ? String(studentAns) : '',
            is_correct: isCorrect,
            points_earned: pointsEarned
          }, { onConflict: 'submission_id,question_id' });

        if (ansError) {
          console.error('Quiz answer logging error:', ansError);
        }
      }

      // Upsert Grade
      const { error: gradeError } = await adminClient
        .from('grades')
        .upsert({
          submission_id: submission.id,
          score: totalPointsEarned,
          max_score: totalMaxPoints,
          feedback: `Auto-graded. Correct questions: ${correctCount}/${questions.length}`,
          graded_by: user.id, // System record override via service client
          graded_at: new Date().toISOString()
        }, { onConflict: 'submission_id' });

      if (gradeError) {
        console.error('Grade creation error:', gradeError);
        return NextResponse.json({ error: 'Failed to record quiz grade.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        submissionId: submission.id,
        status: submission.status,
        score: totalPointsEarned,
        maxScore: totalMaxPoints,
        correctCount,
        totalQuestions: questions.length
      });
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      status: submission.status
    });
  } catch (err: any) {
    console.error('Assignment submission API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
