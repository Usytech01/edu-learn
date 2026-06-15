'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let institutionId: string | null = null;
      let institutionName = '';

      // Validate invite code if provided
      if (inviteCode.trim() !== '') {
        const { data, error: rpcError } = await supabase.rpc('validate_invite_code', {
          code: inviteCode.trim().toUpperCase(),
        });

        if (rpcError) {
          throw new Error('Failed to validate invite code: ' + rpcError.message);
        }

        // The RPC returns a setof record / table: [{ institution_id: '...', institution_name: '...' }]
        const validated = data as { institution_id: string; institution_name: string }[];
        if (validated && validated.length > 0) {
          institutionId = validated[0].institution_id;
          institutionName = validated[0].institution_name;
        } else {
          throw new Error('Invalid invite code. Please check with your school administrator.');
        }
      }

      // Register user through Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
            institution_id: institutionId || '',
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        setSuccessMsg('Registration successful! Please check your email to verify your account, or sign in if email verification is bypassed.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
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

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                disabled={loading}
              />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Role</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                  disabled={loading}
                />
                Student
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={() => setRole('teacher')}
                  disabled={loading}
                />
                Teacher
              </label>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.edu"
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
              placeholder="At least 6 characters"
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              School Invite Code <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(Optional)</span>
            </label>
            <input
              type="text"
              className="input-field"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. LINCOLN01"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button} className="btn btn-primary">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link href="/login" style={styles.link}>Sign In</Link>
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
    maxWidth: '460px',
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
  radioGroup: {
    display: 'flex',
    gap: '20px',
    marginTop: '4px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    color: '#334155',
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
};
