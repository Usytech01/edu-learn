'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function StudentAssignmentsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sorting State
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'due_asc' | 'due_desc' | 'points_desc'>('due_asc');

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

      // 2. Fetch Submissions
      const { data: studentSubmissions, error: subError } = await supabase
        .from('submissions')
        .select('*, grade:grades(*)')
        .eq('student_id', user.id);

      if (subError) throw subError;
      setSubmissions(studentSubmissions || []);

      // 3. Fetch Assignments
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
    } catch (err) {
      console.error('Error fetching assignments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to determine status details
  const getAssignmentStatus = (assignmentId: string) => {
    const sub = submissions.find(s => s.assignment_id === assignmentId);
    if (!sub) return { label: 'Pending', color: '#ef4444', bgColor: '#fee2e2', key: 'pending' };
    if (sub.status === 'graded') return { label: 'Graded', color: '#10b981', bgColor: '#d1fae5', key: 'graded' };
    return { label: 'Submitted', color: '#3b82f6', bgColor: '#dbeafe', key: 'submitted' };
  };

  // Filter & Sort Calculations
  const filteredAssignments = assignments
    .filter((assignment) => {
      const statusInfo = getAssignmentStatus(assignment.id);
      
      // Filter by Tab Status
      if (statusTab !== 'all' && statusInfo.key !== statusTab) {
        return false;
      }

      // Filter by Class
      if (selectedClass !== 'all' && assignment.class_id !== selectedClass) {
        return false;
      }

      // Filter by Type
      if (selectedType !== 'all' && assignment.type !== selectedType) {
        return false;
      }

      // Filter by Search Query
      if (searchQuery.trim() !== '') {
        const titleMatch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = (assignment.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const classNameMatch = assignment.class?.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!titleMatch && !descMatch && !classNameMatch) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'due_asc') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === 'due_desc') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      } else {
        return b.points - a.points;
      }
    });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Assignments</h1>
          <p style={styles.subtitle}>View pending coursework, quizzes, submitted tasks, and grading feedback.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabsContainer}>
        {(['all', 'pending', 'submitted', 'graded'] as const).map((tab) => {
          const isActive = statusTab === tab;
          const count = assignments.filter(a => {
            const statusInfo = getAssignmentStatus(a.id);
            return tab === 'all' || statusInfo.key === tab;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              style={{
                ...styles.tabButton,
                ...(isActive ? styles.tabButtonActive : {}),
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{
                ...styles.tabBadge,
                backgroundColor: isActive ? '#4f46e5' : '#e2e8f0',
                color: isActive ? '#ffffff' : '#475569',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div style={styles.filtersBar} className="glass">
        {/* Search */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Search</label>
          <input
            type="text"
            placeholder="Search assignments or classes..."
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchField}
          />
        </div>

        {/* Class Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Class</label>
          <select
            className="input-field"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={styles.selectField}
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Type</label>
          <select
            className="input-field"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={styles.selectField}
          >
            <option value="all">All Types</option>
            <option value="homework">Homework</option>
            <option value="quiz">Quiz</option>
            <option value="project">Project</option>
            <option value="exam">Exam</option>
          </select>
        </div>

        {/* Sort Order */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort By</label>
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={styles.selectField}
          >
            <option value="due_asc">Due Date: Closest First</option>
            <option value="due_desc">Due Date: Furthest First</option>
            <option value="points_desc">Points: High to Low</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: '3rem', marginBottom: '12px' }}>📖</span>
          <h3 style={{ margin: 0, color: '#1e293b' }}>No assignments found</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', maxWidth: '400px' }}>
            No assignments match your search query, selected filters, or active tab. Try tweaking your search parameters.
          </p>
        </div>
      ) : (
        <div style={styles.assignmentsGrid}>
          {filteredAssignments.map((assignment) => {
            const statusInfo = getAssignmentStatus(assignment.id);
            const sub = submissions.find(s => s.assignment_id === assignment.id);
            const formattedDate = assignment.due_date 
              ? new Date(assignment.due_date).toLocaleDateString(undefined, { 
                  weekday: 'short', 
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
                <div style={styles.assignmentCard} className="card">
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
                      <h3 style={styles.assignmentTitle}>{assignment.title}</h3>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      color: statusInfo.color,
                      backgroundColor: statusInfo.bgColor
                    }}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <p style={styles.assignmentClass}>{assignment.class?.name}</p>
                  
                  {assignment.description && (
                    <p style={styles.assignmentDesc}>
                      {assignment.description.length > 120 
                        ? `${assignment.description.slice(0, 120)}...` 
                        : assignment.description}
                    </p>
                  )}

                  <div style={styles.cardFooter}>
                    <div style={styles.dueDateBox}>
                      <span style={{ fontSize: '0.85rem' }}>📅</span>
                      <span style={styles.dueDateText}>Due: {formattedDate}</span>
                    </div>

                    <div style={styles.footerRight}>
                      {sub?.grade && (
                        <div style={styles.scoreBox}>
                          <span style={styles.scoreText}>Score:</span>
                          <strong style={{ color: '#10b981' }}>{sub.grade.score}/{sub.grade.max_score}</strong>
                        </div>
                      )}
                      <span style={styles.pointsBadge}>{assignment.points} Points</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
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
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    marginTop: '6px',
  },
  tabsContainer: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '1px',
    marginBottom: '24px',
    overflowX: 'auto',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  tabButtonActive: {
    color: '#4f46e5',
    borderBottomColor: '#4f46e5',
  },
  tabBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  filtersBar: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: '1 1 200px',
  },
  filterLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  searchField: {
    padding: '10px 14px',
    fontSize: '0.9rem',
  },
  selectField: {
    padding: '10px 14px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    appearance: 'none',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
    textAlign: 'center',
  },
  assignmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px',
  },
  assignmentCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '220px',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  typeBadge: {
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-block',
    letterSpacing: '0.5px',
  },
  assignmentTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '10px',
    marginBottom: '0',
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  assignmentClass: {
    fontSize: '0.85rem',
    color: '#4f46e5',
    fontWeight: '600',
    margin: '4px 0 10px',
  },
  assignmentDesc: {
    fontSize: '0.88rem',
    color: '#64748b',
    lineHeight: '1.5',
    margin: '0 0 20px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
  },
  dueDateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#475569',
  },
  dueDateText: {
    fontSize: '0.82rem',
    fontWeight: '500',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  scoreBox: {
    fontSize: '0.85rem',
    backgroundColor: '#ecfdf5',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #a7f3d0',
    display: 'flex',
    gap: '4px',
  },
  scoreText: {
    color: '#065f46',
    fontWeight: '500',
  },
  pointsBadge: {
    fontSize: '0.82rem',
    color: '#475569',
    fontWeight: '600',
    backgroundColor: '#f8fafc',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
};
