'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignUp = async () => {
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
      setErrorMsg(err.message || 'Failed to sign up with Google.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass">
        <h1 style={styles.title}>Join Edu-Learn</h1>
        <p style={styles.subtitle}>Create your student or teacher account to get started.</p>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        {/* Google Sign-Up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          style={styles.googleBtn}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '10px', flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p style={styles.footerText}>
          Already have an account? <Link href="/login" style={styles.link}>Sign In</Link>
        </p>
        <p style={{ ...styles.footerText, marginTop: '8px' }}>
          By signing up, you agree to our terms of service and privacy policy.
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
    padding: '40px 24px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1e293b',
  },
  title: {
    fontSize: '2rem',
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
  row: {
    display: 'flex',
    gap: '12px',
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
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginTop: '6px',
  },
  roleCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 10px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    gap: '5px',
  },
  roleCardActive: {
    border: '2px solid #4f46e5',
    backgroundColor: '#eef2ff',
    boxShadow: '0 4px 14px rgba(79,70,229,0.15)',
  },
  roleIcon: {
    fontSize: '1.8rem',
  },
  roleName: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  roleDesc: {
    fontSize: '0.72rem',
    color: '#64748b',
    lineHeight: '1.3',
  },
  checkBadge: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: '#fff',
    fontSize: '0.65rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
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
  success: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '0.85rem',
    marginBottom: '16px',
    border: '1px solid #a7f3d0',
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
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'box-shadow 0.2s, border-color 0.2s',
    marginBottom: '4px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '8px 0 4px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0',
    display: 'block',
  },
  dividerText: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
};
