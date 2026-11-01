'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/types';
import {
  Shield,
  ShieldCheck,
  Wrench,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  LogOut,
  Sparkles
} from 'lucide-react';

interface PresetAccount {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  password: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
  allowedFeatures: string[];
  deniedFeatures: string[];
}

const PRESET_ACCOUNTS: PresetAccount[] = [
  {
    role: 'admin',
    label: 'Administrator',
    name: 'Admin User',
    email: 'admin@autocare.com',
    password: 'password123',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderColor: 'border-blue-500/40 hover:border-blue-400',
    icon: ShieldCheck,
    description: 'Executive authority: financial ledgers, inventory restocking, user administration, and raw SQL Query Runner.',
    allowedFeatures: [
      'Full access to all 13 MySQL tables',
      'Inventory restock & parts price overrides',
      'Invoice generation & settlement audits',
      'Interactive SQL Query Runner (20 queries)',
      'MongoDB inspection analytics pipelines'
    ],
    deniedFeatures: [
      'None (Superuser privilege)'
    ]
  },
  {
    role: 'service_advisor',
    label: 'Service Advisor',
    name: 'Rajesh Kumar',
    email: 'rajesh@autocare.com',
    password: 'password123',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    icon: Users,
    description: 'Front-desk intake coordinator: service appointments, assigning mechanics to job cards, and customer invoicing.',
    allowedFeatures: [
      'Schedule customer appointments',
      'Create and dispatch job cards to mechanics',
      'Issue invoices, calculate 18% GST & record payments',
      'View customer vehicle fleet history',
      'Vehicle catalogue & parts inventory viewer'
    ],
    deniedFeatures: [
      'Cannot execute raw SQL queries in SQL Runner',
      'Cannot modify system user accounts'
    ]
  },
  {
    role: 'mechanic',
    label: 'Senior Mechanic',
    name: 'Suresh Mehta',
    email: 'suresh@autocare.com',
    password: 'password123',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    icon: Wrench,
    description: 'Hands-on technician: job progress updates, polymorphic MongoDB inspection reports, and diagnostic vector search.',
    allowedFeatures: [
      'View assigned workshop jobs and vehicle history',
      'Update job card status (assigned -> in_progress -> completed)',
      'Create polymorphic MongoDB repair & inspection reports',
      'Allocate required spare parts to active jobs',
      'Diagnostic semantic vector similarity search'
    ],
    deniedFeatures: [
      'Forbidden from viewing or settling invoices',
      'Forbidden from accessing customer billing accounts',
      'Forbidden from accessing SQL Query Runner'
    ]
  }
];

export default function LoginPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to detect role from typed email
  const detectRoleFromEmail = (inputEmail: string): PresetAccount | null => {
    const clean = inputEmail.toLowerCase().trim();
    if (!clean) return null;
    if (clean === 'admin@autocare.com' || clean.startsWith('admin')) {
      return PRESET_ACCOUNTS[0]; // Admin
    }
    if (clean === 'rajesh@autocare.com' || clean === 'priya@autocare.com' || clean.includes('advisor')) {
      return PRESET_ACCOUNTS[1]; // Service Advisor
    }
    if (clean === 'suresh@autocare.com' || clean === 'anjali@autocare.com' || clean === 'vikram@autocare.com' || clean.includes('mechanic')) {
      return PRESET_ACCOUNTS[2]; // Mechanic
    }
    return null;
  };

  const detectedAccount = detectRoleFromEmail(email);

  const selectAccountPreset = (preset: PresetAccount) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // If user was previously signed in, ensure clean session
      if (user) {
        await logout();
      }

      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setErrorMessage('Authentication failed. Check your email and password, or choose one of the roles below.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
            AC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-white">AutoCare Insight</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                RBAC Security Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Role-Based Access Control &bull; PES University DBMS Experiential Learning Level 3
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-3 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 text-xs">
            <span className="text-slate-400">Active:</span>
            <strong className="text-white capitalize font-semibold">{user.full_name} ({user.role.replace('_', ' ')})</strong>
            <button
              type="button"
              onClick={async () => {
                await logout();
                setEmail('');
              }}
              className="ml-2 flex items-center space-x-1 text-rose-400 hover:text-rose-300 font-semibold"
              title="Terminate current session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full my-6">

        {/* Existing Active Session Alert */}
        {user && (
          <div className="mb-6 p-4 rounded-xl bg-blue-900/30 border border-blue-500/40 text-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div className="text-xs">
                <div>You are currently signed in as <strong className="text-white">{user.full_name}</strong> with role <strong className="text-blue-300 uppercase">{user.role.replace('_', ' ')}</strong>.</div>
                <div className="text-slate-400 mt-0.5">Strict role isolation is active. To enter a different role, you must log out first.</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center space-x-1"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setEmail('');
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Portal Introduction */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign In to Your Operational Workspace
          </h1>
          <p className="mt-2 text-slate-400 text-xs sm:text-sm leading-relaxed">
            Enter your email address to unlock your assigned role interface (Administrator, Service Advisor, or Senior Mechanic).
          </p>
        </div>

        {/* Primary Email Entry & Login Box */}
        <div className="max-w-lg mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          
          {/* Quick Role Selection Buttons */}
          <div className="mb-6">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Select or Type Your Role Account
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_ACCOUNTS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = email.toLowerCase().trim() === preset.email;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => selectAccountPreset(preset)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/50 shadow-md'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${preset.color}`} />
                    <span className="text-xs font-bold text-white">{preset.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-mono">{preset.email.split('@')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-2.5 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Authentication Notice: </strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@autocare.com, rajesh@autocare.com, suresh@autocare.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Dynamic Live Role Detection Preview */}
              {detectedAccount ? (
                <div className="mt-2.5 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs">
                  <span className="text-slate-400">Identified Role:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] border ${detectedAccount.badgeBg}`}>
                    {detectedAccount.label}
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">({detectedAccount.name})</span>
                </div>
              ) : email.includes('@') ? (
                <div className="mt-2 text-[11px] text-slate-400">
                  Custom MySQL user account will be verified upon sign-in.
                </div>
              ) : null}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {detectedAccount
                        ? `Sign In as ${detectedAccount.label}`
                        : 'Sign In to Workspace'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2 text-[11px] text-slate-400">
              Demo accounts use password: <code className="text-blue-400 font-mono font-bold">password123</code>
            </div>

          </form>
        </div>

        {/* Role Entitlements & Features Grid */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Enforced Role Segregation (Strict RBAC Model)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Once authenticated, your interface is locked to that role. You cannot switch roles until you log out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESET_ACCOUNTS.map((preset) => {
              const Icon = preset.icon;
              return (
                <div
                  key={preset.role}
                  className={`rounded-xl bg-slate-900/70 border p-5 flex flex-col justify-between ${preset.borderColor}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-5 h-5 ${preset.color}`} />
                        <h4 className="text-sm font-bold text-white">{preset.label}</h4>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${preset.badgeBg}`}>
                        {preset.role.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="space-y-1.5 border-t border-slate-800 pt-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Authorized Views &amp; Actions
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {preset.allowedFeatures.map((feat, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 border-t border-slate-800 pt-3 mt-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Strict Security Restrictions
                      </div>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {preset.deniedFeatures.map((den, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                            <span>{den}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => selectAccountPreset(preset)}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                      Use {preset.label} Email ({preset.email})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        AutoCare Insight &bull; PES University Department of Computer Science &amp; Engineering &bull; DBMS Level 3 Project
      </div>

    </div>
  );
}
