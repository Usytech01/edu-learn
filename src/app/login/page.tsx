'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        redirectUser(user.id);
      }
    };
    checkUser();
  }, []);

  const redirectUser = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single();

    if (profile) {
      if (profile.status === 'pending') {
        router.push('/onboarding');
      } else if (profile.role === 'teacher') {
        router.push('/dashboard/teacher');
      } else if (profile.role === 'student') {
        router.push('/dashboard/student');
      } else if (profile.role === 'school_admin' || profile.role === 'it_admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/onboarding');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await redirectUser(data.user.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass">
        <h1 style={styles.title}>Edu-Learn</h1>
        <p style={styles.subtitle}>Welcome back! Please sign in to your account.</p>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button} className="btn btn-primary">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link href="/register" style={styles.link}>Register here</Link>
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
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1e293b',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '8px',
    background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '10px',
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.85rem',
    marginBottom: '16px',
    border: '1px solid #fecaca',
  },
  footerText: {
    marginTop: '24px',
    fontSize: '0.9rem',
    textAlign: 'center',
    color: '#64748b',
  },
  link: {
    color: '#4f46e5',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
