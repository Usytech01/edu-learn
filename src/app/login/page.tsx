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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in with Google.');
      setLoading(false);
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

          {/* Google Sign‑In */}
          <div style={styles.googleContainer}>
            <button type="button" onClick={handleGoogleLogin} style={styles.googleBtn} className="btn btn-secondary" disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
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
  googleContainer: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  googleBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid var(--bg-border)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)',
  },
};
