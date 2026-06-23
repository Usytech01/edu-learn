'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role, status, created_at')
          .order('created_at', { ascending: false });

        const users = profiles || [];
        const students = users.filter((u) => u.role === 'student');
        const teachers = users.filter((u) => u.role === 'teacher');

        // Fetch all classes
        const { data: classes } = await supabase
          .from('classes')
          .select('id');

        setStats({
          totalUsers: users.length,
          totalClasses: (classes || []).length,
          totalStudents: students.length,
          totalTeachers: teachers.length,
        });

        setRecentUsers(users.slice(0, 10));
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading admin panel...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#4f46e5' },
    { label: 'Teachers', value: stats.totalTeachers, icon: '📚', color: '#06b6d4' },
    { label: 'Students', value: stats.totalStudents, icon: '🎓', color: '#10b981' },
    { label: 'Classes', value: stats.totalClasses, icon: '🏫', color: '#f59e0b' },
  ];

  const roleColors: { [key: string]: { bg: string; color: string } } = {
    student: { bg: '#d1fae5', color: '#065f46' },
    teacher: { bg: '#dbeafe', color: '#1e40af' },
    school_admin: { bg: '#ede9fe', color: '#5b21b6' },
    it_admin: { bg: '#fce7f3', color: '#9d174d' },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Panel</h1>
        <p style={styles.subtitle}>Manage users, classes, and monitor institution-wide activity.</p>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((stat) => (
          <div key={stat.label} style={styles.statCard} className="card">
            <div style={styles.statHeader}>
              <span style={{ fontSize: '1.8rem' }}>{stat.icon}</span>
              <span style={styles.statLabel}>{stat.label}</span>
            </div>
            <div style={{ ...styles.statVal, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Users Table */}
      <div style={styles.tableCard} className="card">
        <h2 style={styles.tableTitle}>Recent Users</h2>
        {recentUsers.length === 0 ? (
          <p style={{ color: '#64748b', padding: '20px 0' }}>No users found.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => {
                  const roleStyle = roleColors[user.role] || { bg: '#f1f5f9', color: '#475569' };
                  return (
                    <tr key={user.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <span style={styles.avatarInline}>
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                        {user.first_name} {user.last_name}
                      </td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.roleBadge,
                          backgroundColor: roleStyle.bg,
                          color: roleStyle.color,
                        }}>
                          {user.role?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: user.status === 'active' ? '#d1fae5' : '#fef3c7',
                          color: user.status === 'active' ? '#065f46' : '#92400e',
                        }}>
                          {user.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: '#64748b', fontSize: '0.82rem' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
  header: {
    marginBottom: '32px',
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
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statVal: {
    fontSize: '2.4rem',
    fontWeight: '800',
    marginTop: '12px',
    color: '#0f172a',
  },
  tableCard: {
    padding: '28px',
  },
  tableTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHead: {
    backgroundColor: '#f8fafc',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.9rem',
    color: '#1e293b',
    verticalAlign: 'middle',
  },
  avatarInline: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginRight: '10px',
    flexShrink: 0,
    verticalAlign: 'middle',
  },
  roleBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-block',
    letterSpacing: '0.4px',
  },
  statusBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-block',
  },
};
