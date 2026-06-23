'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentDetailPage({ params }: PageProps) {
  const { id: assignmentId } = use(params);

  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submission form state
  const [textContent, setTextContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  
  // Quiz answers state: questionId -> answer string
  const [studentQuizAnswers, setStudentQuizAnswers] = useState<{ [key: string]: string }>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const supabase = createClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Assignment
      const { data: assignData, error: assignError } = await supabase
        .from('assignments')
        .select('*, class:classes(name)')
        .eq('id', assignmentId)
        .maybeSingle();

      if (assignError || !assignData) throw new Error('Assignment not found');
      setAssignment(assignData);

      // 2. Fetch Submission if exists
      const { data: subData } = await supabase
        .from('submissions')
        .select('*, grade:grades(*)')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id)
        .maybeSingle();

      setSubmission(subData);

      if (subData) {
        setTextContent(subData.content || '');
        setFileUrl(subData.file_url || '');

        // If it's a quiz and graded, fetch detailed question answers
        if (assignData.type === 'quiz' && subData.status === 'graded') {
          const { data: answersData } = await supabase
            .from('quiz_answers')
            .select('*, question:quiz_questions(*)')
            .eq('submission_id', subData.id);
          
          setQuizAnswers(answersData || []);
        }
      }

      // 3. Fetch Quiz Questions if it's a quiz and not submitted/graded yet
      if (assignData.type === 'quiz' && (!subData || subData.status === 'draft')) {
        const { data: qData } = await supabase
          .from('quiz_questions')
          .select('id, type, prompt, options_json, points')
          .eq('assignment_id', assignmentId)
          .order('order_index', { ascending: true });
        
        setQuestions(qData || []);

        // Initialize quiz answers state
        const initialAnswers: { [key: string]: string } = {};
        qData?.forEach((q: any) => {
          initialAnswers[q.id] = '';
        });
        setStudentQuizAnswers(initialAnswers);
      }
    } catch (err: any) {
      console.error('Error fetching assignment details:', err);
      setSubmitError(err.message || 'Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      const payload: any = {};
      if (assignment.type === 'quiz') {
        // Validate all questions answered
        const unanswered = questions.filter(q => !studentQuizAnswers[q.id]);
        if (unanswered.length > 0) {
          throw new Error(`Please answer all questions before submitting. (${unanswered.length} unanswered)`);
        }
        payload.answers = studentQuizAnswers;
      } else {
        payload.content = textContent;
        payload.fileUrl = fileUrl;
      }

      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');

      setSubmitSuccess(assignment.type === 'quiz' ? 'Quiz completed and auto-graded!' : 'Assignment submitted successfully!');
      
      // Reload Data
      await fetchData();
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setStudentQuizAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading assignment...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div style={styles.container}>
        <div style={styles.errorAlert}>Assignment not found or you do not have permission to view it.</div>
        <Link href="/dashboard/student/assignments" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Assignments
        </Link>
      </div>
    );
  }

  const formattedDate = assignment.due_date 
    ? new Date(assignment.due_date).toLocaleString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    : 'No Due Date';

  const isSubmitted = submission && submission.status !== 'draft';
  const isGraded = submission && submission.status === 'graded';

  return (
    <div style={styles.container}>
      {/* Breadcrumb & Navigation */}
      <div style={styles.navBar}>
        <Link href="/dashboard/student/assignments" style={styles.backLink}>
          ← Back to Assignments
        </Link>
      </div>

      {/* Main Details Card */}
      <div style={styles.mainCard} className="card">
        <div style={styles.cardHeader}>
          <div>
            <span style={{
              ...styles.typeBadge,
              backgroundColor: 
                assignment.type === 'quiz' ? '#fae8ff' : 
                assignment.type === 'project' ? '#ecfeff' : 
                assignment.type === 'exam' ? '#ffe4e6' : '#f0fdf4',
              color: 
                assignment.type === 'quiz' ? '#a21caf' : 
                assignment.type === 'project' ? '#0891b2' : 
                assignment.type === 'exam' ? '#e11d48' : '#166534',
            }}>
              {assignment.type.toUpperCase()}
            </span>
            <h1 style={styles.title}>{assignment.title}</h1>
            <p style={styles.className}>{assignment.class?.name}</p>
          </div>

          <div style={styles.pointsBadgeBox}>
            <span style={styles.pointsLabel}>Max Points</span>
            <span style={styles.pointsVal}>{assignment.points}</span>
          </div>
        </div>

        <div style={styles.metaRow}>
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>📅</span>
            <span><strong>Due:</strong> {formattedDate}</span>
          </div>
          {submission && (
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>📤</span>
              <span>
                <strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}
                {submission.is_late && <span style={styles.lateTag}>LATE</span>}
              </span>
            </div>
          )}
        </div>

        {assignment.description && (
          <div style={styles.descriptionSection}>
            <h3 style={styles.sectionHeader}>Instructions / Description</h3>
            <p style={styles.descriptionText}>{assignment.description}</p>
          </div>
        )}
      </div>

      {/* Error / Success Alerts */}
      {submitError && <div style={styles.errorAlert}>{submitError}</div>}
      {submitSuccess && <div style={styles.successAlert}>{submitSuccess}</div>}

      {/* --- submission state views --- */}

      {isGraded ? (
        /* GRADED STATE */
        <div style={styles.gradedCard} className="card">
          <div style={styles.gradeDisplayHeader}>
            <h2 style={styles.gradeCardTitle}>Grading Result & Feedback</h2>
            <div style={styles.gradeCircle}>
              <span style={styles.gradeScoreNumber}>{submission.grade.score}</span>
              <span style={styles.gradeDivider}>/</span>
              <span style={styles.gradeMaxNumber}>{submission.grade.max_score}</span>
            </div>
          </div>

          {submission.grade.feedback && (
            <div style={styles.feedbackSection}>
              <h4 style={{ margin: 0, color: '#0f172a' }}>Teacher's Feedback:</h4>
              <p style={styles.feedbackBody}>{submission.grade.feedback}</p>
            </div>
          )}

          {assignment.type === 'quiz' && quizAnswers.length > 0 && (
            <div style={styles.quizReviewSection}>
              <h3 style={styles.sectionHeader}>Quiz Details Review</h3>
              <div style={styles.quizReviewList}>
                {quizAnswers.map((qa, index) => (
                  <div 
                    key={qa.id} 
                    style={{
                      ...styles.reviewQuestionItem,
                      borderLeft: qa.is_correct ? '4px solid #10b981' : '4px solid #ef4444'
                    }}
                    className="card"
                  >
                    <div style={styles.reviewHeader}>
                      <span style={styles.questionNumber}>Question {index + 1}</span>
                      <span style={{
                        ...styles.correctTag,
                        color: qa.is_correct ? '#10b981' : '#ef4444',
                        backgroundColor: qa.is_correct ? '#d1fae5' : '#fee2e2'
                      }}>
                        {qa.is_correct ? 'Correct (+ ' + qa.points_earned + ' pts)' : 'Incorrect (0 pts)'}
                      </span>
                    </div>
                    <p style={styles.reviewPrompt}>{qa.question?.prompt}</p>
                    <div style={styles.reviewAnswersRow}>
                      <div style={styles.reviewAnswerBlock}>
                        <span style={styles.answerBlockLabel}>Your Answer:</span>
                        <span style={{
                          ...styles.answerBlockVal,
                          color: qa.is_correct ? '#10b981' : '#ef4444',
                          fontWeight: '700'
                        }}>
                          {qa.answer}
                        </span>
                      </div>
                      {!qa.is_correct && (
                        <div style={styles.reviewAnswerBlock}>
                          <span style={styles.answerBlockLabel}>Correct Answer:</span>
                          <span style={{ ...styles.answerBlockVal, color: '#10b981', fontWeight: '750' }}>
                            {qa.question?.correct_answer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : isSubmitted ? (
        /* SUBMITTED BUT PENDING GRADE STATE */
        <div style={styles.submittedCard} className="card">
          <div style={styles.submittedHeader}>
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <h2 style={styles.submittedTitle}>Submission Received!</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0' }}>Your work has been submitted to your teacher for review.</p>
          </div>

          {assignment.type !== 'quiz' && (
            <div style={styles.submissionSummary}>
              {textContent && (
                <div style={styles.summaryItem}>
                  <strong style={styles.summaryLabel}>Submitted Content:</strong>
                  <div style={styles.summaryContentBox}>{textContent}</div>
                </div>
              )}
              {fileUrl && (
                <div style={styles.summaryItem}>
                  <strong style={styles.summaryLabel}>Submitted File / Link:</strong>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={styles.summaryFileLink}>
                    {fileUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* FORM SUBMISSION STATE */
        <div style={styles.formCard} className="card">
          <h2 style={styles.formTitle}>
            {assignment.type === 'quiz' ? 'Take Quiz' : 'Your Submission'}
          </h2>

          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            {assignment.type === 'quiz' ? (
              /* QUIZ QUESTIONS INPUT */
              <div style={styles.quizQuestionsList}>
                {questions.map((q, index) => (
                  <div key={q.id} style={styles.quizQuestionItem} className="card">
                    <div style={styles.quizQuestionHeader}>
                      <span style={styles.questionNumber}>Question {index + 1}</span>
                      <span style={styles.questionPoints}>{q.points} pts</span>
                    </div>
                    <p style={styles.quizQuestionPrompt}>{q.prompt}</p>

                    {/* MCQs & TF options */}
                    {q.options_json && Array.isArray(q.options_json) && (
                      <div style={styles.optionsList}>
                        {q.options_json.map((option: string) => {
                          const isSelected = studentQuizAnswers[q.id] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleSelectOption(q.id, option)}
                              style={{
                                ...styles.optionButton,
                                ...(isSelected ? styles.optionButtonActive : {})
                              }}
                            >
                              <span style={{
                                ...styles.optionIndicator,
                                backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                                borderColor: isSelected ? '#4f46e5' : '#cbd5e1',
                              }} />
                              <span style={styles.optionText}>{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* REGULAR ASSIGNMENT FORM */
              <div style={styles.regularFormFields}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Text Submission</label>
                  <p style={styles.formFieldDesc}>Type your answer or paste your essay response here.</p>
                  <textarea
                    rows={8}
                    className="input-field"
                    placeholder="Enter your homework response here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    style={styles.textArea}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Submission Link / File URL</label>
                  <p style={styles.formFieldDesc}>Provide a Google Drive, GitHub, or file URL if required.</p>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://example.com/your-submission"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={styles.submitBtn}
            >
              {submitting ? 'Submitting Work...' : assignment.type === 'quiz' ? 'Submit Quiz Answers' : 'Submit Assignment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '850px',
    margin: '0 auto',
    paddingBottom: '60px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  navBar: {
    marginBottom: '20px',
  },
  backLink: {
    fontSize: '0.95rem',
    color: '#4f46e5',
    fontWeight: '600',
    textDecoration: 'none',
  },
  mainCard: {
    padding: '30px',
    marginBottom: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
  },
  typeBadge: {
    fontSize: '0.75rem',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-block',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '12px',
    marginBottom: '4px',
  },
  className: {
    fontSize: '1rem',
    color: '#4f46e5',
    fontWeight: '600',
    margin: 0,
  },
  pointsBadgeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '10px 16px',
    minWidth: '100px',
  },
  pointsLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pointsVal: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '2px',
  },
  metaRow: {
    display: 'flex',
    gap: '24px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#475569',
  },
  metaIcon: {
    fontSize: '1rem',
  },
  lateTag: {
    marginLeft: '8px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  descriptionSection: {
    marginTop: '30px',
  },
  sectionHeader: {
    fontSize: '1.1rem',
    fontWeight: '750',
    color: '#1e293b',
    marginBottom: '10px',
  },
  descriptionText: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  errorAlert: {
    padding: '14px 18px',
    borderRadius: '12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.9rem',
    marginBottom: '24px',
    border: '1px solid #fecaca',
    fontWeight: '500',
  },
  successAlert: {
    padding: '14px 18px',
    borderRadius: '12px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '0.9rem',
    marginBottom: '24px',
    border: '1px solid #a7f3d0',
    fontWeight: '500',
  },
  formCard: {
    padding: '30px',
  },
  formTitle: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  regularFormFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#334155',
  },
  formFieldDesc: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '0 0 4px',
  },
  textArea: {
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  submitBtn: {
    marginTop: '24px',
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '700',
  },
  quizQuestionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  quizQuestionItem: {
    padding: '20px 24px',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  quizQuestionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  questionNumber: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  questionPoints: {
    fontSize: '0.82rem',
    color: '#64748b',
    fontWeight: '600',
  },
  quizQuestionPrompt: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  optionButtonActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
    boxShadow: '0 0 0 1px #4f46e5',
  },
  optionIndicator: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'block',
    flexShrink: 0,
  },
  optionText: {
    fontSize: '0.92rem',
    color: '#334155',
    fontWeight: '500',
  },
  submittedCard: {
    padding: '40px',
    textAlign: 'center',
  },
  submittedHeader: {
    marginBottom: '24px',
  },
  submittedTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '12px',
  },
  submissionSummary: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '24px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  summaryLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  summaryContentBox: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.92rem',
    color: '#334155',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  summaryFileLink: {
    fontSize: '0.92rem',
    color: '#4f46e5',
    textDecoration: 'underline',
    wordBreak: 'break-all',
  },
  gradedCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  gradeDisplayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  gradeCardTitle: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  gradeCircle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    backgroundColor: '#ecfdf5',
    border: '2px solid #a7f3d0',
    borderRadius: '12px',
    padding: '12px 24px',
  },
  gradeScoreNumber: {
    fontSize: '2rem',
    fontWeight: '900',
    color: '#10b981',
  },
  gradeDivider: {
    fontSize: '1.2rem',
    color: '#64748b',
  },
  gradeMaxNumber: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#475569',
  },
  feedbackSection: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    borderLeft: '4px solid #10b981',
  },
  feedbackBody: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: '1.5',
    marginTop: '8px',
    margin: 0,
  },
  quizReviewSection: {
    marginTop: '10px',
  },
  quizReviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  reviewQuestionItem: {
    padding: '20px',
    backgroundColor: '#ffffff',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  correctTag: {
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  reviewPrompt: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  reviewAnswersRow: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
  },
  reviewAnswerBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  answerBlockLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  answerBlockVal: {
    fontSize: '0.9rem',
  },
};
