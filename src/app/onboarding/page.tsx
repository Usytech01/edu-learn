'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Role = 'student' | 'teacher';

export default function OnboardingPage() {
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [userId, setUserId] = useState('');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Check if profile already exists and is active
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role, status, first_name')
        .eq('id', user.id)
        .single();

      if (existingProfile?.status === 'active') {
        redirectToDashboard(existingProfile.role);
        return;
      }

      // Extract name from Google metadata
      const meta = user.user_metadata || {};
      const firstName = meta.given_name || meta.full_name?.split(' ')[0] || meta.name?.split(' ')[0] || 'there';
      setUserName(firstName);
      setAvatarUrl(meta.avatar_url || meta.picture || '');
      setFetchingUser(false);
    };

    init();
  }, []);

  const redirectToDashboard = (role: string) => {
    if (role === 'teacher') {
      router.push('/dashboard/teacher');
    } else if (role === 'student') {
      router.push('/dashboard/student');
    } else {
      router.push('/dashboard/admin');
    }
  };

  const handleConfirm = async () => {
    if (!selectedRole || !userId) return;
    setLoading(true);
    setErrorMsg('');

    try {
      // Call server-side API route which uses the service role key to bypass RLS
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      redirectToDashboard(selectedRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b', marginTop: '12px' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          {avatarUrl && (
            <img src={avatarUrl} alt="Profile" style={styles.avatar} />
          )}
          <h1 style={styles.title}>Welcome, {userName}! 👋</h1>
          <p style={styles.subtitle}>One last step — tell us how you'll be using Edu-Learn.</p>
        </div>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        {/* Role Selection */}
        <p style={styles.roleLabel}>I am a...</p>
        <div style={styles.roleGrid}>
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'student' ? styles.roleCardActive : {}),
            }}
          >
            <span style={styles.roleIcon}>🎓</span>
            <span style={styles.roleName}>Student</span>
            <span style={styles.roleDesc}>I want to learn and access course materials</span>
            {selectedRole === 'student' && <span style={styles.checkBadge}>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'teacher' ? styles.roleCardActive : {}),
            }}
          >
            <span style={styles.roleIcon}>📚</span>
            <span style={styles.roleName}>Teacher</span>
            <span style={styles.roleDesc}>I want to create and manage courses</span>
            {selectedRole === 'teacher' && <span style={styles.checkBadge}>✓</span>}
          </button>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedRole || loading}
          style={{
            ...styles.confirmBtn,
            ...(!selectedRole || loading ? styles.confirmBtnDisabled : {}),
          }}
        >
          {loading ? 'Setting up your account...' : `Continue as ${selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '...'}`}
        </button>

        <p style={styles.note}>
          Your Google account details will be used to set up your profile automatically.
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '40px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255,255,255,0.97)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    color: '#1e293b',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    border: '3px solid #e2e8f0',
    marginBottom: '16px',
    objectFit: 'cover',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: '1.5',
  },
  roleLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '28px',
  },
  roleCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
    borderRadius: '14px',
    border: '2px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    gap: '8px',
  },
  roleCardActive: {
    border: '2px solid #4f46e5',
    backgroundColor: '#eef2ff',
    boxShadow: '0 4px 14px rgba(79,70,229,0.2)',
  },
  roleIcon: {
    fontSize: '2.2rem',
  },
  roleName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  roleDesc: {
    fontSize: '0.78rem',
    color: '#64748b',
    lineHeight: '1.4',
  },
  checkBadge: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: '#fff',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  confirmBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#4f46e5',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
  },
  confirmBtnDisabled: {
    backgroundColor: '#c7d2fe',
    cursor: 'not-allowed',
  },
  note: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.85rem',
    marginBottom: '20px',
    border: '1px solid #fecaca',
  },
};
