'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Class, AtRiskAlert, Profile, Submission } from '@/types';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [alerts, setAlerts] = useState<AtRiskAlert[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassTerm, setNewClassTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formError, setFormError] = useState('');

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Classes
    const { data: classList } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id);

    const classesData = (classList || []) as Class[];
    setClasses(classesData);

    const classIds = classesData.map(c => c.id);

    if (classIds.length > 0) {
      // Fetch At-Risk Alerts
      const { data: alertList } = await supabase
        .from('at_risk_alerts')
        .select('*, student:profiles!student_id(*), class:classes!class_id(*)')
        .in('class_id', classIds)
        .is('resolved_at', null);
      setAlerts((alertList || []) as any);

      // Fetch Submissions that need grading
      const { data: subList } = await supabase
        .from('submissions')
        .select('*, student:profiles!student_id(*), assignment:assignments!assignment_id(*)')
        .eq('status', 'submitted')
        .in('assignment.class_id', classIds); // Filter submissions by teacher's classes

      // Since PostgREST filter on joined table (in('assignment.class_id', ...)) returns all if not careful,
      // let's manually filter local results just in case to be 100% correct and robust.
      const filteredSubs = (subList || []).filter((sub: any) => 
        sub.assignment && classIds.includes(sub.assignment.class_id)
      );

      setPendingSubmissions(filteredSubs);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.institution_id) {
      setFormError('No institution associated with your account.');
      return;
    }

    // Generate random 8 character class code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let classCode = '';
    for (let i = 0; i < 8; i++) {
      classCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: newClassName,
        subject: newClassSubject,
        grade_level: newClassGrade || null,
        term: newClassTerm || null,
        teacher_id: user.id,
        institution_id: profile.institution_id,
        class_code: classCode,
      })
      .select();

    if (error) {
      setFormError(error.message || 'Failed to create class.');
    } else {
      setShowCreateModal(false);
      setNewClassName('');
      setNewClassSubject('');
      setNewClassGrade('');
      setNewClassTerm('');
      fetchData();
    }
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('at_risk_alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) {
      alert('Failed to resolve alert: ' + error.message);
    } else {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  };

  if (loading) {
    return <div>Loading your dashboard data...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <p style={styles.subtitle}>Manage classes, grade assignments, and monitor student performance.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          Create New Class
        </button>
      </div>

      <div style={styles.layout}>
        {/* Left column: Classes & Pending Submissions */}
        <div style={styles.mainCol}>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Your Classes</h2>
            {classes.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No classes created yet. Create a class to get started!</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {classes.map((c) => (
                  <Link href={`/dashboard/teacher/classes/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                    <div style={styles.classCard} className="card">
                      <h3 style={styles.classTitle}>{c.name}</h3>
                      <p style={styles.classSub}>{c.subject} • {c.term || 'No Term'}</p>
                      <div style={styles.codeBadge}>
                        Code: <strong>{c.class_code}</strong>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Submissions Pending Grading</h2>
            {pendingSubmissions.length === 0 ? (
              <div style={styles.emptyState}>
                <p>All clean! No pending submissions to grade.</p>
              </div>
            ) : (
              <div style={styles.submissionsList}>
                {pendingSubmissions.map((sub) => (
                  <div key={sub.id} style={styles.submissionItem} className="card">
                    <div>
                      <h4 style={{ margin: 0, color: '#0f172a' }}>{sub.assignment?.title}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Submitted by {sub.student?.first_name} {sub.student?.last_name}
                      </p>
                    </div>
                    <Link href={`/dashboard/teacher/grade/${sub.id}`}>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                        Grade Now
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: At-risk Alerts */}
        <div style={styles.sideCol}>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>At-Risk Alerts</h2>
            {alerts.length === 0 ? (
              <div style={styles.noAlerts}>
                <p>🎉 All students doing great! No active alerts.</p>
              </div>
            ) : (
              <div style={styles.alertsList}>
                {alerts.map((alert: any) => (
                  <div key={alert.id} style={styles.alertCard} className="card">
                    <div style={styles.alertHeader}>
                      <span style={{
                        ...styles.severityTag,
                        backgroundColor: alert.severity === 'high' ? '#fee2e2' : alert.severity === 'medium' ? '#fef3c7' : '#e0f2fe',
                        color: alert.severity === 'high' ? '#b91c1c' : alert.severity === 'medium' ? '#d97706' : '#0369a1',
                      }}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <button onClick={() => resolveAlert(alert.id)} style={styles.resolveBtn}>Resolve</button>
                    </div>
                    <h4 style={{ margin: '8px 0 4px', color: '#0f172a' }}>
                      {alert.student?.first_name} {alert.student?.last_name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                      Class: <strong>{alert.class?.name}</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
                      {alert.trigger_reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="glass">
            <h2>Create New Class</h2>
            {formError && <div style={styles.error}>{formError}</div>}
            <form onSubmit={handleCreateClass} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label>Class Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Algebra I"
                />
              </div>
              <div style={styles.inputGroup}>
                <label>Subject</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div style={styles.inputGroup}>
                <label>Grade Level</label>
                <input
                  type="text"
                  className="input-field"
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value)}
                  placeholder="e.g. 9th Grade"
                />
              </div>
              <div style={styles.inputGroup}>
                <label>Term</label>
                <input
                  type="text"
                  className="input-field"
                  value={newClassTerm}
                  onChange={(e) => setNewClassTerm(e.target.value)}
                  placeholder="e.g. Fall 2026"
                />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b',
    marginTop: '4px',
  },
  layout: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  mainCol: {
    flex: '2 1 600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  sideCol: {
    flex: '1 1 300px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  classCard: {
    padding: '20px',
    cursor: 'pointer',
    position: 'relative',
  },
  classTitle: {
    fontSize: '1.15rem',
    color: '#0f172a',
  },
  classSub: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '4px',
  },
  codeBadge: {
    display: 'inline-block',
    marginTop: '12px',
    padding: '4px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: '#475569',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
    color: '#64748b',
  },
  submissionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  submissionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  },
  noAlerts: {
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    color: '#15803d',
    fontWeight: '500',
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  alertCard: {
    padding: '16px',
    borderLeft: '4px solid #ef4444',
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severityTag: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  resolveBtn: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.8rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '20px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
  },
  error: {
    color: '#ef4444',
    fontSize: '0.85rem',
  },
};
