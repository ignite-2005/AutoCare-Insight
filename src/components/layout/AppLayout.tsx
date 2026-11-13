"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/types';
import { PageTransition } from '@/components/motion/SiteMotion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LayoutDashboard, Calendar, Wrench, ClipboardCheck, Car, Package, Receipt, Users, ShieldCheck, Menu, X, LogOut, Sparkles, Terminal, BarChart3, ArrowUpRight } from 'lucide-react';

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
  const sidebarRef = useRef<HTMLElement>(null);
  const isPublic = pathname === '/' || pathname === '/login' || pathname === '/design-review';

  useEffect(() => {
    if (!loading && !user && !isPublic) router.replace('/login');
  }, [loading, user, isPublic, router]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 801px)');
    const closeOnDesktop = () => { if (desktop.matches) setMobileMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    const content = document.querySelector('.workspace-body');
    content?.setAttribute('inert', '');
    const focusable = () => Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []).filter(element => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMobileMenuOpen(false); }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; content?.removeAttribute('inert'); document.removeEventListener('keydown', escape); if (previousFocus?.isConnected) previousFocus.focus(); };
  }, [mobileMenuOpen]);

  if (isPublic) return <>{children}</>;
  if (loading) return <main className="session-loading" aria-live="polite"><Wrench size={32} /><h1>Opening your workspace</h1><p>Checking your session…</p></main>;
  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));
  const current = NAV_ITEMS.find(item => item.href === pathname);
  const role = user.role === 'admin' ? 'Administrator' : user.role === 'mechanic' ? 'Mechanic' : 'Service advisor';

  return (
    <div className="workspace" data-area={pathname.split('/')[1]}>
      <a href="#workspace-main" className="skip-link">Skip to workspace</a>
      {mobileMenuOpen && <button type="button" className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
      <aside ref={sidebarRef} id="workspace-navigation" className={`workspace-sidebar ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Workspace navigation">
        <div className="sidebar-brand-row"><Link href="/" className="brand-lockup"><span className="brand-symbol" aria-hidden="true">A<span>↗</span></span><span>AutoCare <strong>Insight</strong><small>WORKSHOP INTELLIGENCE</small></span></Link><button type="button" className="icon-button mobile-only" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)}><X size={20} /></button></div>
        <nav aria-label="Main workspace">
          {['Operations', 'Insights & data'].map((group, index) => <div className="nav-group" key={group}><p>{group}</p>{visibleItems.filter(item => index === 0 ? !['/sql-runner', '/aggregations', '/search', '/catalogue'].includes(item.href) : ['/sql-runner', '/aggregations', '/search', '/catalogue'].includes(item.href)).map(item => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} data-area={item.href.slice(1)} className={`sidebar-link ${pathname === item.href ? 'is-active' : ''}`} aria-current={pathname === item.href ? 'page' : undefined}><Icon size={18} /><span>{item.name.replace('Spare Parts Inventory', 'Parts & inventory').replace('Registered Vehicles', 'Vehicles').replace('Invoices & Billing', 'Invoices & billing')}</span></Link>;
          })}</div>)}
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-account"><span className="account-avatar">{user.full_name?.slice(0, 2).toUpperCase() || 'AC'}</span><div><strong>{user.full_name}</strong><span>{role}</span></div></div><button type="button" className="sidebar-signout" onClick={async () => { await logout(); router.push('/login'); }}><LogOut size={16} /> Sign out</button></div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="workspace-breadcrumb"><button type="button" className="icon-button mobile-only" aria-label="Open navigation" aria-expanded={mobileMenuOpen} aria-controls="workspace-navigation" onClick={() => setMobileMenuOpen(true)}><Menu size={21} /></button><span>Workspace</span><span className="breadcrumb-divider">/</span><strong>{current?.name || 'Overview'}</strong></div>
          <div className="workspace-topbar-actions"><span className="role-label"><ShieldCheck size={14} />{role}</span><ThemeToggle /><Link href="/" className="icon-button" aria-label="View product introduction" title="Product introduction"><ArrowUpRight size={18} /></Link></div>
        </header>
        <main id="workspace-main" className="workspace-main"><PageTransition route={pathname}>{children}</PageTransition></main>
        <footer className="workspace-footer"><span>AutoCare Insight <span className="footer-dot">/</span> Vehicle service, connected.</span><span>PES University · DBMS Project</span></footer>
      </div>
    </div>
  );
}
