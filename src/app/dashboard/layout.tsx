'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!userProfile) {
        router.push('/login');
        return;
      }

      if (userProfile.status === 'pending') {
        router.push('/onboarding');
        return;
      }

      setProfile(userProfile as Profile);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingBox}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>Edu-Learn</div>
        <div style={styles.profileBox}>
          <div style={styles.avatar}>
            {profile?.first_name[0]}{profile?.last_name[0]}
          </div>
          <div style={styles.profileDetails}>
            <div style={styles.name}>{profile?.first_name} {profile?.last_name}</div>
            <div style={styles.role}>{profile?.role.toUpperCase().replace('_', ' ')}</div>
          </div>
        </div>
        <nav style={styles.nav}>
          {profile?.role === 'teacher' && (
            <>
              <Link href="/dashboard/teacher" style={styles.navLink}>Overview</Link>
              <Link href="/dashboard/teacher/classes" style={styles.navLink}>My Classes</Link>
              <Link href="/dashboard/teacher/alerts" style={styles.navLink}>At-Risk Alerts</Link>
            </>
          )}
          {profile?.role === 'student' && (
            <>
              <Link href="/dashboard/student" style={styles.navLink}>Dashboard</Link>
              <Link href="/dashboard/student/assignments" style={styles.navLink}>My Assignments</Link>
            </>
          )}
          {(profile?.role === 'school_admin' || profile?.role === 'it_admin') && (
            <>
              <Link href="/dashboard/admin" style={styles.navLink}>Admin Panel</Link>
              <Link href="/dashboard/admin/users" style={styles.navLink}>Manage Users</Link>
            </>
          )}
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </aside>
      <main style={styles.content}>{children}</main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  loadingBox: {
    padding: '20px 40px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    fontWeight: '500',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    padding: '30px 20px',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#38bdf8',
    marginBottom: '40px',
    textAlign: 'center',
  },
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    marginBottom: '30px',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  role: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    letterSpacing: '0.5px',
    marginTop: '2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.15s ease',
    backgroundColor: 'transparent',
  },
  logoutBtn: {
    padding: '12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'background-color 0.15s',
  },
  content: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
    height: '100vh',
  },
};
