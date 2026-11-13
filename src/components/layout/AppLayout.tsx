'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  Calendar,
  Wrench,
  ClipboardCheck,
  Car,
  Package,
  Receipt,
  Users,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Sparkles,
  Terminal,
  BarChart3,
  Lock
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'service_advisor', 'mechanic']
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    roles: ['admin', 'service_advisor']
  },
  {
    name: 'Workshop Jobs',
    href: '/jobs',
    icon: Wrench,
    roles: ['admin', 'service_advisor', 'mechanic']
  },
  {
    name: 'Repair Reports',
    href: '/reports',
    icon: ClipboardCheck,
    roles: ['admin', 'service_advisor', 'mechanic']
  },
  {
    name: 'Vehicle Catalogue',
    href: '/catalogue',
    icon: Car,
    roles: ['admin', 'service_advisor', 'mechanic']
  },
  {
    name: 'Spare Parts Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['admin', 'service_advisor', 'mechanic']
  },
  {
    name: 'Invoices & Billing',
    href: '/invoices',
    icon: Receipt,
    roles: ['admin', 'service_advisor']
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    roles: ['admin', 'service_advisor']
  },
  {
    name: 'Registered Vehicles',
    href: '/vehicles',
    icon: Car,
    roles: ['admin', 'service_advisor', 'mechanic']
  },
  {
    name: 'SQL Query Runner',
    href: '/sql-runner',
    icon: Terminal,
    roles: ['admin'] // Strictly restricted to Administrator
  },
  {
    name: 'MongoDB Aggregations',
    href: '/aggregations',
    icon: BarChart3,
    roles: ['admin', 'service_advisor', 'mechanic']
  },
  {
    name: 'Diagnostic Search',
    href: '/search',
    icon: Sparkles,
    roles: ['admin', 'service_advisor', 'mechanic']
  }
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Security enforcement: redirect to /login if unauthenticated and not on /login
  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/') {
      router.push('/login');
    }
  }, [loading, user, pathname, router]);

  // The public introduction never waits for a database-backed session.
  if (pathname === '/') return <>{children}</>;

  // Loading spinner during session verification
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Verifying RBAC Session...</p>
      </div>
    );
  }

  // Standalone layout for Login Portal
  if (pathname === '/login') {
    return <main className="min-h-screen">{children}</main>;
  }

  // Prevent rendering protected content before redirect
  if (!user) {
    return null;
  }

  const currentRole = user.role;
  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left brand & mobile hamburger */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
                  AC
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-slate-900 tracking-tight">AutoCare Insight</span>
                    <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Level 3 DBMS
                    </span>
                  </div>
                  <span className="hidden sm:block text-xs text-slate-500 font-medium">
                    Dual-Database Vehicle Service & Predictive Analytics
                  </span>
                </div>
              </Link>
            </div>

            {/* Right actions: Locked Role Indicator & User Profile & Log Out */}
            <div className="flex items-center space-x-3">
              
              {/* FIXED / LOCKED ROLE INDICATOR (Strict RBAC - No dropdown switcher) */}
              <div className="flex items-center select-none" title={`Authenticated as ${currentRole.replace('_', ' ')}. Role is locked to session.`}>
                {currentRole === 'admin' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Administrator</span>
                    <Lock className="w-3 h-3 text-blue-400 ml-1" />
                  </div>
                )}
                {currentRole === 'service_advisor' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Service Advisor</span>
                    <Lock className="w-3 h-3 text-emerald-400 ml-1" />
                  </div>
                )}
                {currentRole === 'mechanic' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Mechanic</span>
                    <Lock className="w-3 h-3 text-amber-400 ml-1" />
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user.full_name?.slice(0, 2) || 'AC'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-900 leading-none">{user.full_name}</div>
                  <div className="text-[10px] text-slate-500">{user.email}</div>
                </div>
              </div>

              {/* Explicit Log Out Button */}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition shadow-xs"
                title="Log out of this role and switch accounts"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>

            </div>
          </div>
        </div>

        {/* Sub-header Navigation for desktop (Role-filtered) */}
        <nav className="hidden md:flex border-t border-slate-100 bg-slate-50/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full flex space-x-1 py-1.5 overflow-x-auto">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {currentRole.replace('_', ' ').toUpperCase()} NAVIGATION
              </span>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                  router.push('/login');
                }}
                className="flex items-center space-x-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div>AutoCare Insight &copy; 2026 PES University &bull; Experiential Learning Level 3</div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>MySQL 8.0</span>
            <span>&bull;</span>
            <span>MongoDB 8.2</span>
            <span>&bull;</span>
            <span>Next.js 14 App Router</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
