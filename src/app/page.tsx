import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>Edu-Learn</div>
        <div style={styles.navLinks}>
          <Link href="/login" style={styles.navLink}>Sign In</Link>
          <Link href="/register" style={styles.navBtn} className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Empowering Education through data-driven insights.</h1>
          <p style={styles.heroSub}>
            A complete learning management platform connecting teachers, students, and administrators with automated grading, progress tracking, and personalized analytics.
          </p>
          <div style={styles.ctaGroup}>
            <Link href="/register" style={styles.heroBtn} className="btn btn-primary">Sign Up Free</Link>
            <Link href="/login" style={styles.heroBtnSecondary} className="btn btn-secondary">Access Portal</Link>
          </div>
        </section>

        <section style={styles.features}>
          <div style={styles.featureCard} className="card">
            <h3>For Teachers</h3>
            <p>Reduce administrative workload with smart grading, robust assignment creators, and direct feedback.</p>
          </div>
          <div style={styles.featureCard} className="card">
            <h3>For Students</h3>
            <p>Track your academic progress, complete interactive quizzes, and receive personalized study guidance.</p>
          </div>
          <div style={styles.featureCard} className="card">
            <h3>For Admins</h3>
            <p>Access institution-wide analytics and manage student/teacher rosters with simple controls.</p>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Edu-Learn LMS. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  logo: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#4f46e5',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: '#475569',
    fontWeight: '500',
    textDecoration: 'none',
  },
  navBtn: {
    padding: '8px 16px',
    fontSize: '0.9rem',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  hero: {
    textAlign: 'center',
    maxWidth: '800px',
    marginBottom: '60px',
  },
  heroTitle: {
    fontSize: '3.2rem',
    fontWeight: '800',
    lineHeight: '1.2',
    color: '#0f172a',
    marginBottom: '20px',
  },
  heroSub: {
    fontSize: '1.2rem',
    color: '#475569',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  ctaGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  },
  heroBtn: {
    padding: '14px 28px',
    fontSize: '1.05rem',
  },
  heroBtnSecondary: {
    padding: '14px 28px',
    fontSize: '1.05rem',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '30px',
    width: '100%',
    maxWidth: '1000px',
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footer: {
    textAlign: 'center',
    padding: '30px',
    borderTop: '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: '0.9rem',
  },
};
