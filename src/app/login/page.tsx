'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_CREDENTIALS } from '@/lib/context/AuthContext';
import { UserRole } from '@/types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
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
  UserCheck,
  Sparkles,
  Users,
  Receipt,
  Terminal,
  Car
} from 'lucide-react';

interface RoleCardInfo {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  title: string;
  description: string;
  badgeColor: string;
  borderColor: string;
  icon: React.ElementType;
  keyPermissions: string[];
  restrictions: string[];
}

const ROLE_CARDS: RoleCardInfo[] = [
  {
    role: 'admin',
    name: 'Admin User',
    email: 'admin@autocare.com',
    password: 'password123',
    title: 'System Administrator',
    description: 'Executive management authority across all workshop operations, staff, inventory mutations, and financial ledgers.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    borderColor: 'border-blue-500/30 hover:border-blue-500',
    icon: ShieldCheck,
    keyPermissions: [
      'Full Read/Write access to all 13 MySQL tables',
      'Inventory restock, pricing & catalog mutations',
      'Invoice creation, discounts & settlement audits',
      'Execute 20+ analytical queries in SQL Runner',
      'Access all MongoDB inspection aggregation pipelines'
    ],
    restrictions: [
      'None (Superuser privilege level)'
    ]
  },
  {
    role: 'service_advisor',
    name: 'Rajesh Kumar',
    email: 'rajesh@autocare.com',
    password: 'password123',
    title: 'Service Advisor',
    description: 'Front-desk customer coordinator handling appointment intake, job card creation, and billing settlement.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500',
    icon: Users,
    keyPermissions: [
      'Schedule customer service appointments',
      'Create and assign workshop job cards to mechanics',
      'Generate invoices, calculate GST & collect payments',
      'Access customer fleet profiles and history',
      'Run operational SQL queries and reports'
    ],
    restrictions: [
      'Cannot modify system user accounts',
      'Cannot perform direct inventory reorder overrides'
    ]
  },
  {
    role: 'mechanic',
    name: 'Suresh Mehta',
    email: 'suresh@autocare.com',
    password: 'password123',
    title: 'Senior Workshop Mechanic',
    description: 'Hands-on automotive technician responsible for vehicle diagnostics, multi-point inspections, and part installations.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    borderColor: 'border-amber-500/30 hover:border-amber-500',
    icon: Wrench,
    keyPermissions: [
      'View assigned service jobs and vehicle history',
      'Update job card progress (assigned -> in_progress -> completed)',
      'Create polymorphic MongoDB repair & inspection reports',
      'Allocate required spare parts to active jobs',
      'Diagnostic semantic vector similarity search'
    ],
    restrictions: [
      'Cannot access or settle customer invoices',
      'Cannot delete customer or catalogue records',
      'Cannot access financial executive dashboards'
    ]
  }
];

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');

  const handleManualLogin = async (e: React.FormEvent) => {
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
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setErrorMessage('Invalid credentials. Check email and password or use one of the 1-click role buttons below.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRoleLogin = async (roleEmail: string, rolePass: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    setEmail(roleEmail);
    setPassword(rolePass);

    try {
      const success = await login(roleEmail, rolePass);
      if (success) {
        router.push('/dashboard');
      } else {
        setErrorMessage(`Failed to authenticate as ${roleEmail}.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Bar Branding */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-8 border-b border-slate-700/60">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition">
            AC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-white">AutoCare Insight</span>
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                RBAC Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Role-Based Access Control Authentication &bull; PES University Level 3 DBMS
            </p>
          </div>
        </Link>

        {user && (
          <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-400">Signed in as: </span>
              <strong className="text-white capitalize">{user.full_name} ({user.role.replace('_', ' ')})</strong>
            </div>
            <Link
              href="/dashboard"
              className="ml-2 inline-flex items-center space-x-1 font-semibold text-blue-400 hover:text-blue-300 underline"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full my-8">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Role-Based Access Control (RBAC) Portal
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            Select your operational role below to authenticate into the dual-database automotive service management system, or enter specific credentials.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'quick'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Fast Role Sign-In (Evaluation Mode)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('credentials')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'credentials'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Manual Email & Password Login</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-bold">Authentication Notice: </strong>
              {errorMessage}
            </div>
          </div>
        )}

        {/* TAB 1: 1-Click Role Login Cards */}
        {activeTab === 'quick' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLE_CARDS.map((card) => {
              const Icon = card.icon;
              const isCurrent = user?.role === card.role;
              return (
                <div
                  key={card.role}
                  className={`relative rounded-2xl bg-slate-800/90 border-2 p-6 flex flex-col justify-between transition-all duration-200 shadow-xl backdrop-blur-sm ${
                    card.borderColor
                  } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow">
                      Active Session
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-slate-700/60 border border-slate-600/50 text-white">
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${card.badgeColor}`}>
                        {card.role.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{card.title}</h3>
                    <div className="text-xs text-blue-400 font-mono mt-0.5">{card.email}</div>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                      {card.description}
                    </p>

                    {/* Permissions list */}
                    <div className="mt-5 space-y-2 border-t border-slate-700/60 pt-4">
                      <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Authorized Permissions
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {card.keyPermissions.map((perm, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{perm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Restrictions list */}
                    <div className="mt-4 space-y-1.5 border-t border-slate-700/60 pt-3">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Enforced Restrictions
                      </div>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {card.restrictions.map((restr, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                            <span>{restr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-700/60">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleQuickRoleLogin(card.email, card.password)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-lg ${
                        isCurrent
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                      }`}
                    >
                      <span>{isCurrent ? 'Continue as ' + card.title : 'Sign In as ' + card.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="text-center mt-2 text-[10px] text-slate-500">
                      Default password: <code className="text-slate-400">{card.password}</code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Manual Credentials Form */}
        {activeTab === 'credentials' && (
          <div className="max-w-md mx-auto bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-2 text-center">Account Sign In</h2>
            <p className="text-xs text-slate-400 text-center mb-6">
              Enter the credentials of any pre-seeded user in MySQL <code className="text-blue-400">autocare_insight.users</code>
            </p>

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                    placeholder="e.g. admin@autocare.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authenticate &amp; Open System</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-4 border-t border-slate-700/60">
                <span className="text-xs text-slate-400">
                  Tip: Standard demo password for all seeded accounts is{' '}
                  <code className="text-blue-400 font-mono font-bold">password123</code>
                </span>
              </div>
            </form>
          </div>
        )}

        {/* RBAC Access Matrix Table */}
        <div className="mt-14 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              Role-Based Access Control (RBAC) Entitlements Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            The platform enforces server-side route guards, database transaction restrictions, and dynamic UI component filters based on the authenticated session's cryptographic JWT claims.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">System Module / Endpoint</th>
                  <th className="py-3 px-4 text-center">Administrator</th>
                  <th className="py-3 px-4 text-center">Service Advisor</th>
                  <th className="py-3 px-4 text-center">Senior Mechanic</th>
                  <th className="py-3 px-4">Security Enforcement Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Dashboard &amp; Revenue Analytics</td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Full Access (Read/Export)</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Operational View</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-amber-400 font-bold">Work Order View</span></td>
                  <td className="py-3 px-4 text-slate-400">UI &amp; API Aggregation Filter</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Service Appointments &amp; Booking</td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Manage All</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Manage All</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-slate-400">Read-Only</span></td>
                  <td className="py-3 px-4 text-slate-400">API Route Guard (`requireRole`)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Workshop Job Cards &amp; Progress</td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Assign &amp; Reassign</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Create &amp; Dispatch</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Execute &amp; Complete</span></td>
                  <td className="py-3 px-4 text-slate-400">Database Status State Machine</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">MongoDB Polymorphic Repair Reports</td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Audit &amp; Review</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Customer Presentation</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Create Findings</span></td>
                  <td className="py-3 px-4 text-slate-400">MongoDB JSON Schema Validator</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Invoices, Tax Calculation &amp; Payments</td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Issue &amp; Settle</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Issue &amp; Collect</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-rose-400 font-bold flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" /> Forbidden</span></td>
                  <td className="py-3 px-4 text-slate-400">Strict HTTP 403 Forbidden</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Inventory Management &amp; Reordering</td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Restock &amp; Pricing</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-slate-400">View Stock Levels</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-amber-400 font-bold">Deduct Consumables</span></td>
                  <td className="py-3 px-4 text-slate-400">Database Trigger &amp; Stock Guard</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Interactive SQL Query Runner</td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">All 20 Queries</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Operational Queries</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-rose-400 font-bold flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" /> Forbidden</span></td>
                  <td className="py-3 px-4 text-slate-400">Query Registry RBAC Filter</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Diagnostic Vector Similarity Search</td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Full Access</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Full Access</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-emerald-400 font-bold">Full Access</span></td>
                  <td className="py-3 px-4 text-slate-400">In-Memory 64D Vector Engine</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full pt-8 border-t border-slate-700/60 text-center text-xs text-slate-500">
        AutoCare Insight &bull; PES University Department of Computer Science and Engineering &bull; Database Management Systems (DBMS Level 3)
      </div>

    </div>
  );
}
