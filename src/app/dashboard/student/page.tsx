'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Enrollment, Class, Assignment, Submission, Grade } from '@/types';
import Link from 'next/link';

export default function StudentDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    enrolledClasses: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    averageGrade: 'N/A',
  });

  // Join Class State
  const [classCode, setClassCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const supabase = createClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Enrolled Classes
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('*, class:classes(*, teacher:profiles(*))')
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollError) throw enrollError;

      const enrolledClasses = enrollments?.map((e: any) => e.class) || [];
      setClasses(enrolledClasses);

      const classIds = enrolledClasses.map((c: any) => c.id);

      // 2. Fetch Student Submissions
      const { data: studentSubmissions, error: subError } = await supabase
        .from('submissions')
        .select('*, grade:grades(*)')
        .eq('student_id', user.id);

      if (subError) throw subError;
      setSubmissions(studentSubmissions || []);

      // 3. Fetch Assignments for Enrolled Classes
      if (classIds.length > 0) {
        const { data: classAssignments, error: assignError } = await supabase
          .from('assignments')
          .select('*, class:classes(name)')
          .in('class_id', classIds)
          .eq('status', 'published');

        if (assignError) throw assignError;
        setAssignments(classAssignments || []);
      } else {
        setAssignments([]);
      }
    } catch (err: any) {
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Stats & Statuses whenever data changes
  useEffect(() => {
    const classCount = classes.length;
    
    // Map submission status to assignments
    let completedCount = 0;
    let pendingCount = 0;
    
    assignments.forEach((assignment) => {
      const sub = submissions.find(s => s.assignment_id === assignment.id);
      if (sub && sub.status !== 'draft') {
        completedCount++;
      } else {
        pendingCount++;
      }
    });

    // Calculate average grade
    let totalScore = 0;
    let totalMax = 0;
    let gradedCount = 0;

    submissions.forEach((sub) => {
      if (sub.grade) {
        totalScore += Number(sub.grade.score);
        totalMax += Number(sub.grade.max_score);
        gradedCount++;
      }
    });

    const avgGrade = totalMax > 0 
      ? `${((totalScore / totalMax) * 100).toFixed(1)}%` 
      : 'N/A';

    setStats({
      enrolledClasses: classCount,
      pendingAssignments: pendingCount,
      completedAssignments: completedCount,
      averageGrade: avgGrade,
    });
  }, [classes, assignments, submissions]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    setJoinLoading(true);

    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join class.');

      setJoinSuccess(`Successfully joined ${data.className}!`);
      setClassCode('');
      // Refresh Dashboard
      await fetchData();
    } catch (err: any) {
      setJoinError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading your dashboard...</p>
      </div>
    );
  }

  // Get status for each assignment helper
  const getAssignmentStatus = (assignmentId: string) => {
    const sub = submissions.find(s => s.assignment_id === assignmentId);
    if (!sub) return { label: 'Pending', color: '#ef4444', bgColor: '#fee2e2' };
    if (sub.status === 'graded') return { label: 'Graded', color: '#10b981', bgColor: '#d1fae5' };
    return { label: 'Submitted', color: '#3b82f6', bgColor: '#dbeafe' };
  };

  // Recent grades (submissions with grades)
  const gradedSubmissions = submissions
    .filter(s => s.grade)
    .sort((a, b) => new Date(b.grade.graded_at).getTime() - new Date(a.grade.graded_at).getTime())
    .slice(0, 5);

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner} className="glass">
        <h1 style={styles.welcomeTitle}>Student Dashboard</h1>
        <p style={styles.welcomeSubtitle}>Track your assignments, view grades, and join new classes in one centralized place.</p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard} className="card">
          <div style={styles.statHeader}>
            <span style={{ fontSize: '1.8rem' }}>🏫</span>
            <span style={styles.statLabel}>Enrolled Classes</span>
          </div>
          <div style={styles.statVal}>{stats.enrolledClasses}</div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={styles.statHeader}>
            <span style={{ fontSize: '1.8rem' }}>⏳</span>
            <span style={styles.statLabel}>Pending Tasks</span>
          </div>
          <div style={{ ...styles.statVal, color: stats.pendingAssignments > 0 ? '#ef4444' : '#10b981' }}>
            {stats.pendingAssignments}
          </div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={styles.statHeader}>
            <span style={{ fontSize: '1.8rem' }}>✅</span>
            <span style={styles.statLabel}>Completed Tasks</span>
          </div>
          <div style={styles.statVal}>{stats.completedAssignments}</div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={styles.statHeader}>
            <span style={{ fontSize: '1.8rem' }}>📈</span>
            <span style={styles.statLabel}>Average Grade</span>
          </div>
          <div style={{ ...styles.statVal, color: '#4f46e5' }}>{stats.averageGrade}</div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={styles.layoutGrid}>
        {/* Left Column: Join Class & Classes List */}
        <div style={styles.leftCol}>
          {/* Join Class Card */}
          <div style={styles.joinClassCard} className="card">
            <h3 style={styles.cardTitle}>Join a New Class</h3>
            <p style={styles.cardDesc}>Enter the 8-character class code provided by your teacher.</p>
            {joinError && <div style={styles.errorAlert}>{joinError}</div>}
            {joinSuccess && <div style={styles.successAlert}>{joinSuccess}</div>}
            
            <form onSubmit={handleJoinClass} style={styles.joinForm}>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="e.g. AB12CD34"
                className="input-field"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                style={styles.joinInput}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={joinLoading}
                style={styles.joinBtn}
              >
                {joinLoading ? 'Joining...' : 'Join Class'}
              </button>
            </form>
          </div>

          {/* Classes Section */}
          <div>
            <h3 style={styles.sectionHeader}>My Classes</h3>
            {classes.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎓</span>
                <p style={{ margin: 0, fontWeight: 500 }}>No classes joined yet.</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Enter a class code above to enroll in your first course.</p>
              </div>
            ) : (
              <div style={styles.classesList}>
                {classes.map((cls) => (
                  <div key={cls.id} style={styles.classCard} className="card">
                    <div style={styles.classCardHeader}>
                      <h4 style={styles.className}>{cls.name}</h4>
                      <span style={styles.classTerm}>{cls.term || 'No Term'}</span>
                    </div>
                    <p style={styles.classSubject}>{cls.subject}</p>
                    <div style={styles.classFooter}>
                      <div style={styles.teacherInfo}>
                        <span style={styles.teacherIcon}>👤</span>
                        <span style={styles.teacherName}>
                          Teacher: {cls.teacher?.first_name} {cls.teacher?.last_name}
                        </span>
                      </div>
                      <span style={styles.classCodeBadge}>Code: {cls.class_code}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assignments & Grades */}
        <div style={styles.rightCol}>
          {/* Assignments Section */}
          <div style={{ marginBottom: '30px' }}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionHeader}>Upcoming Assignments</h3>
              <Link href="/dashboard/student/assignments" style={styles.viewAllLink}>
                View All →
              </Link>
            </div>
            
            {assignments.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '2rem' }}>📚</span>
                <p style={{ margin: '8px 0 0', fontWeight: 500 }}>No published assignments.</p>
              </div>
            ) : (
              <div style={styles.assignmentsList}>
                {assignments
                  .slice(0, 5)
                  .map((assignment) => {
                    const status = getAssignmentStatus(assignment.id);
                    const formattedDate = assignment.due_date 
                      ? new Date(assignment.due_date).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) 
                      : 'No Due Date';

                    return (
                      <Link 
                        href={`/dashboard/student/assignments/${assignment.id}`} 
                        key={assignment.id} 
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={styles.assignmentItem} className="card">
                          <div style={styles.assignMain}>
                            <h4 style={styles.assignTitle}>{assignment.title}</h4>
                            <p style={styles.assignMeta}>
                              {assignment.class?.name} • Due: {formattedDate}
                            </p>
                          </div>
                          <div style={styles.assignRight}>
                            <span 
                              style={{ 
                                ...styles.statusBadge, 
                                color: status.color, 
                                backgroundColor: status.bgColor 
                              }}
                            >
                              {status.label}
                            </span>
                            <span style={styles.assignPoints}>{assignment.points} pts</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recent Grades Section */}
          <div>
            <h3 style={styles.sectionHeader}>Recent Grades & Feedback</h3>
            {gradedSubmissions.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '2rem' }}>📊</span>
                <p style={{ margin: '8px 0 0', fontWeight: 500 }}>No grades available yet.</p>
              </div>
            ) : (
              <div style={styles.gradesList}>
                {gradedSubmissions.map((sub) => {
                  const assignmentName = assignments.find(a => a.id === sub.assignment_id)?.title || 'Assignment';
                  return (
                    <div key={sub.id} style={styles.gradeItem} className="card">
                      <div style={styles.gradeHeader}>
                        <h4 style={styles.gradeTitle}>{assignmentName}</h4>
                        <div style={styles.gradeScoreBox}>
                          <span style={styles.gradeScore}>{sub.grade.score}</span>
                          <span style={styles.gradeDivider}>/</span>
                          <span style={styles.gradeMax}>{sub.grade.max_score}</span>
                        </div>
                      </div>
                      {sub.grade.feedback && (
                        <div style={styles.feedbackBox}>
                          <strong>Feedback:</strong> {sub.grade.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingBottom: '40px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  welcomeBanner: {
    padding: '32px',
    borderRadius: '16px',
    marginBottom: '32px',
    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
    border: '1px solid rgba(79, 70, 229, 0.15)',
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  welcomeSubtitle: {
    fontSize: '1rem',
    color: '#475569',
    marginTop: '6px',
    lineHeight: '1.5',
    maxWidth: '800px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '35px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px',
    minHeight: '130px',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statVal: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '12px',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '35px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  joinClassCard: {
    padding: '24px',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '6px',
    marginBottom: '16px',
  },
  joinForm: {
    display: 'flex',
    gap: '12px',
  },
  joinInput: {
    flex: 1,
    fontSize: '0.95rem',
  },
  joinBtn: {
    padding: '0 24px',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  errorAlert: {
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.85rem',
    marginBottom: '14px',
    border: '1px solid #fecaca',
  },
  successAlert: {
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '0.85rem',
    marginBottom: '14px',
    border: '1px solid #a7f3d0',
  },
  sectionHeader: {
    fontSize: '1.25rem',
    fontWeight: '750',
    color: '#1e293b',
    marginBottom: '16px',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  viewAllLink: {
    fontSize: '0.9rem',
    color: '#4f46e5',
    fontWeight: '600',
    textDecoration: 'none',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
    color: '#64748b',
    textAlign: 'center',
  },
  classesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  classCard: {
    padding: '20px',
  },
  classCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  className: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  classTerm: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    padding: '4px 10px',
    borderRadius: '9999px',
  },
  classSubject: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '4px 0 16px',
  },
  classFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },
  teacherInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  teacherIcon: {
    fontSize: '0.9rem',
  },
  teacherName: {
    fontSize: '0.82rem',
    color: '#475569',
    fontWeight: '500',
  },
  classCodeBadge: {
    fontSize: '0.8rem',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  assignmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  assignmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
  },
  assignMain: {
    flex: 1,
    paddingRight: '12px',
  },
  assignTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  assignMeta: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '4px',
    margin: 0,
  },
  assignRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  assignPoints: {
    fontSize: '0.8rem',
    color: '#475569',
    fontWeight: '600',
  },
  gradesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  gradeItem: {
    padding: '18px 20px',
  },
  gradeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  gradeScoreBox: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  },
  gradeScore: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#10b981',
  },
  gradeDivider: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  gradeMax: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
  },
  feedbackBox: {
    marginTop: '10px',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    borderLeft: '3px solid #cbd5e1',
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: '1.4',
  },
};
