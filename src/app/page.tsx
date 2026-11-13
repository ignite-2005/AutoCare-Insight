import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Wrench, CalendarDays, ClipboardCheck, Package, Database, ShieldCheck } from 'lucide-react';

const features = [
  { icon: CalendarDays, title: 'A better first handover.', text: 'Book appointments, record the complaint, and attach intake photos before a vehicle reaches the bay.', label: '01 / INTAKE' },
  { icon: Wrench, title: 'Keep every bay moving.', text: 'Assign mechanics, track service progress, and allocate parts with automatic stock deductions.', label: '02 / WORKSHOP' },
  { icon: ClipboardCheck, title: 'Give every finding context.', text: 'Capture inspection findings, trouble codes, and health scores in flexible repair reports.', label: '03 / DIAGNOSTICS' },
  { icon: Package, title: 'Close the loop.', text: 'Watch low stock, generate service invoices, and record payments against completed work.', label: '04 / SETTLEMENT' },
];

export default function HomePage() {
  return (
    <div className="showcase">
      <a className="showcase-skip" href="#overview">Skip to content</a>
      <header className="showcase-nav">
        <Link className="showcase-brand" href="/" aria-label="AutoCare Insight home"><span className="showcase-mark"><Wrench size={21} /></span> AutoCare<span className="showcase-muted">Insight</span></Link>
        <nav aria-label="Main navigation"><a href="#workflow">The workflow</a><a href="#preview">Inside the product</a><Link href="/login">Open workspace <ArrowUpRight size={15} /></Link></nav>
      </header>
      <main id="overview">
        <section className="showcase-hero">
          <div className="showcase-eyebrow"><span /> BUILT FOR THE WORK BETWEEN ARRIVAL &amp; RETURN</div>
          <div className="showcase-hero-copy"><h1>Every vehicle.<br />Every detail.<br /><em>Under control.</em></h1><div><p>A connected workspace for the modern workshop. Bring service intake, repair findings, parts, and billing into one clear view.</p><div className="showcase-actions"><Link className="showcase-primary" href="/login">Enter the workshop <ArrowRight size={18} /></Link><a className="showcase-secondary" href="#preview">Take a look inside <ArrowUpRight size={17} /></a></div><p className="showcase-footnote">A working full-stack project. Built around real service workflows.</p></div></div>
          <div className="showcase-art"><Image src="/branding/autocare-banner.svg" alt="AutoCare Insight vehicle blueprint connecting intake, diagnostics, inventory and billing" width={1600} height={650} priority /></div>
          <div className="showcase-strip"><span><ShieldCheck size={17} /> Three authenticated roles</span><span><Database size={17} /> Two complementary databases</span><span><Wrench size={17} /> One connected service journey</span></div>
        </section>
        <section id="workflow" className="showcase-section"><div className="showcase-section-heading"><div><div className="showcase-eyebrow">THE SERVICE JOURNEY</div><h2>Less chasing.<br />More getting things done.</h2></div><p>From the first appointment to the final invoice, each step carries the context your team needs next.</p></div><div className="showcase-features">{features.map(({ icon: Icon, title, text, label }) => <article key={label}><div className="showcase-feature-label">{label}<Icon size={21} /></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section id="preview" className="showcase-section"><div className="showcase-section-heading"><div><div className="showcase-eyebrow">ACTUAL SCREENS. WORKING SOFTWARE.</div><h2>A clearer picture<br />of your workshop.</h2></div><p>Captured from the running application with local sample data. Workspace access requires an authorized account.</p></div><figure className="showcase-screen"><div className="showcase-window-bar"><span /><span /><span /><span className="showcase-window-label">AutoCare Insight / Operations</span></div><Image src="/images/dashboard.jpg" alt="Actual AutoCare operations dashboard with appointments, jobs, stock alerts and fleet health" width={1440} height={1000} /><figcaption>01 / Operations dashboard <span>Service activity, stock alerts, and inspection insights in one place.</span></figcaption></figure><div className="showcase-preview-grid">{[{file:'jobs',title:'02 / Workshop jobs',caption:'Track bay progress and assigned work.'},{file:'reports',title:'03 / Repair reports',caption:'Turn inspection findings into a service record.'}].map(s => <figure className="showcase-screen" key={s.file}><Image src={`/images/${s.file}.jpg`} alt={`Actual AutoCare ${s.file} page with sample records`} width={1440} height={1000} /><figcaption>{s.title}<span>{s.caption}</span></figcaption></figure>)}</div></section>
        <section className="showcase-foundation"><div className="showcase-eyebrow">BUILT WITH PURPOSE</div><h2>Structured where it matters.<br />Flexible where it helps.</h2><p>MySQL keeps appointments, parts, and invoices consistent. MongoDB gives varied inspection findings room to grow. Role-based access keeps workshop responsibilities clear.</p><div className="showcase-tags"><span>Next.js</span><span>TypeScript</span><span>MySQL</span><span>MongoDB</span></div><Link className="showcase-primary" href="/login">Open your workspace <ArrowRight size={18} /></Link></section>
      </main>
      <footer className="showcase-footer"><Link className="showcase-brand" href="/">AutoCare Insight</Link><span>Vehicle service, connected.</span><a href="https://github.com/ignite-2005/AutoCare-Insight" target="_blank" rel="noreferrer">Explore the source <ArrowUpRight size={16} /></a></footer>
    </div>
  );
}
