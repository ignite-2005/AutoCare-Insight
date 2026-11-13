'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (user) {
        await logout();
      }

      const success = await login(cleanEmail, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setErrorMessage('Invalid email or password. Please verify your credentials and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-story">
        <Link href="/" className="brand-lockup"><span className="brand-symbol" aria-hidden="true">A<span>↗</span></span><span>AutoCare <strong>Insight</strong></span></Link>
        <div className="login-story-copy"><p className="eyebrow">WORKSHOP INTELLIGENCE</p><h2>Every service.<br />One connected<br /><span>workspace.</span></h2><p>Keep the handover, the findings, and the work in sync.</p></div>
        <div className="login-story-foot"><ShieldCheck size={16} /> Your role. Your workspace.</div>
      </section>
      <section className="login-panel">
        <div className="login-top"><Link href="/">← Back to AutoCare</Link><ThemeToggle /></div>
        <div className="login-form-wrap">
          <p className="eyebrow">WELCOME BACK</p><h1>Sign in to your workshop.</h1><p className="login-intro">Use your authorized account to continue.</p>
          {user && <div className="session-notice"><ShieldCheck size={18} /><div><p>Signed in as <strong>{user.full_name}</strong></p><div><Link href="/dashboard">Continue to workspace <ArrowRight size={14} /></Link><button type="button" onClick={async () => { await logout(); setEmail(''); setPassword(''); }}>Sign out</button></div></div></div>}
          {errorMessage && <div className="login-error" role="alert"><AlertCircle size={18} /><p>{errorMessage}</p></div>}
          <form onSubmit={handleLoginSubmit}>
            <label htmlFor="login-email">Email address</label>
            <div className="login-input"><Mail size={17} /><input id="login-email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@workshop.com" autoComplete="username" required disabled={isSubmitting} /></div>
            <label htmlFor="login-password">Password</label>
            <div className="login-input"><Lock size={17} /><input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required disabled={isSubmitting} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            <button className="button-primary login-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}<ArrowRight size={18} /></button>
          </form>
          <p className="login-security"><ShieldCheck size={14} /> Access is assigned to your account. Contact your administrator if you need help signing in.</p>
        </div>
        <footer>AutoCare Insight <span>Vehicle service, connected.</span></footer>
      </section>
    </main>
  );
}
