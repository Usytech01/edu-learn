'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Institution, Profile } from '@/types';

export default function OnboardingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInst, setSelectedInst] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      // Fetch user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        setErrorMsg('Error loading profile. Please try logging in again.');
        setFetchingProfile(false);
        return;
      }

      setProfile(userProfile as Profile);
      setFetchingProfile(false);

      // If active, redirect straight to their dashboard
      if (userProfile.status === 'active' && userProfile.institution_id) {
        redirectToDashboard(userProfile.role);
        return;
      }

      // Fetch list of institutions for requesting access
      const { data: instData } = await supabase
        .from('institutions')
        .select('*');
      if (instData) {
        setInstitutions(instData as Institution[]);
      }

      // Check if they already have an active request
      const { data: requestData } = await supabase
        .from('institution_access_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      if (requestData && requestData.length > 0) {
        setRequestSent(true);
      }
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

  const handleUseCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error: rpcError } = await supabase.rpc('validate_invite_code', {
        code: inviteCode.trim().toUpperCase(),
      });

      if (rpcError) throw rpcError;

      const validated = data as { institution_id: string; institution_name: string }[];
      if (validated && validated.length > 0) {
        const instId = validated[0].institution_id;

        // Update profile in database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            institution_id: instId,
            status: 'active',
          })
          .eq('id', profile.id);

        if (updateError) throw updateError;

        setSuccessMsg(`Successfully joined ${validated[0].institution_name}! Redirecting...`);
        setTimeout(() => {
          redirectToDashboard(profile.role);
        }, 2000);
      } else {
        throw new Error('Invalid invite code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply invite code.');
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedInst) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error: requestError } = await supabase
        .from('institution_access_requests')
        .insert({
          user_id: profile.id,
          institution_id: selectedInst,
          status: 'pending',
        });

      if (requestError) throw requestError;

      setRequestSent(true);
      setSuccessMsg('Your access request has been sent to the school administrator. You will be able to access the dashboard once approved.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>Loading your profile...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass">
        <h1 style={styles.title}>Finish Setting Up</h1>
        <p style={styles.subtitle}>Welcome, {profile?.first_name}! You need to connect to an institution before you can access the portal.</p>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        {requestSent ? (
          <div style={styles.pendingContainer}>
            <div style={styles.pendingBadge}>Pending Approval</div>
            <p style={styles.pendingText}>
              Your request for access is currently pending administrator approval. Please contact your school administrator or check back later.
            </p>
            <button
              onClick={async () => {
                const { data: updatedProfile } = await supabase
                  .from('profiles')
                  .select('status, role')
                  .eq('id', profile!.id)
                  .single();
                if (updatedProfile?.status === 'active') {
                  redirectToDashboard(updatedProfile.role);
                } else {
                  alert('Your account is still pending approval.');
                }
              }}
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
            >
              Refresh Status
            </button>
          </div>
        ) : (
          <div>
            {/* Option A: Enter Invite Code */}
            <form onSubmit={handleUseCode} style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Option 1: Enter Invite Code</h3>
              <p style={styles.sectionDesc}>If your school gave you a join code, enter it below to get instant access.</p>
              <div style={styles.inputRow}>
                <input
                  type="text"
                  required
                  placeholder="e.g. LINCOLN01"
                  className="input-field"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  Join School
                </button>
              </div>
            </form>

            <div style={styles.divider}>
              <span>OR</span>
            </div>

            {/* Option B: Request Access (For Teachers) */}
            <form onSubmit={handleRequestAccess} style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Option 2: Request Access</h3>
              <p style={styles.sectionDesc}>Select your school from the list to request approval from the administrator.</p>
              <div style={styles.inputGroup}>
                <select
                  required
                  className="input-field"
                  value={selectedInst}
                  onChange={(e) => setSelectedInst(e.target.value)}
                  disabled={loading || institutions.length === 0}
                  style={{ height: '46px' }}
                >
                  <option value="">-- Select your school --</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading || !selectedInst}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '12px' }}
              >
                Request Access
              </button>
            </form>
          </div>
        )}
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
    padding: '20px 40px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#1e293b',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '8px',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '30px',
  },
  formSection: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
  },
  sectionDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '12px',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  divider: {
    textAlign: 'center',
    margin: '20px 0',
    position: 'relative',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.85rem',
    marginBottom: '20px',
  },
  success: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '0.85rem',
    marginBottom: '20px',
  },
  pendingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '15px',
  },
  pendingBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    backgroundColor: '#fef3c7',
    color: '#d97706',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  pendingText: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: '1.5',
  },
};
