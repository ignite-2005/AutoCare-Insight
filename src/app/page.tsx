import { CinematicHero, ScrollProgress } from '@/components/motion/CinematicHero';
import { ScrollWorkshop } from '@/components/motion/ScrollWorkshop';
import { Reveal } from '@/components/motion/SiteMotion';
import { motionTokens } from '@/lib/motion-tokens';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Wrench, CalendarDays, ClipboardCheck, Package, ShieldCheck, Activity, Car, Gauge, Receipt } from 'lucide-react';

const workflow = [
  { icon: CalendarDays, title: 'Intake', detail: 'Start with a clear handover.', text: 'Appointments, vehicle details and intake photos, ready before the work begins.' },
  { icon: Wrench, title: 'Workshop', detail: 'Keep every bay moving.', text: 'Assigned technicians, job progress and parts usage stay connected to each service.' },
  { icon: ClipboardCheck, title: 'Diagnostics', detail: 'Keep the full picture.', text: 'Inspection findings, trouble codes and repair history, in one service record.' },
  { icon: Receipt, title: 'Settlement', detail: 'Finish with confidence.', text: 'Generate invoices, record payments and keep stock aligned with completed work.' },
];
const previewRows = [
  ['KA 01 · 2048', 'Periodic maintenance', 'In progress'],
  ['KA 03 · 7712', 'Brake inspection', 'Assigned'],
  ['KA 05 · 9306', 'Battery check', 'Completed'],
];

export default function HomePage() {
  return (
    <div className="product-site">
      <ScrollProgress />
      <a href="#product-main" className="skip-link">Skip to content</a>
      <header className="product-nav page-container">
        <Link href="/" className="brand-lockup" aria-label="AutoCare Insight home"><span className="brand-symbol" aria-hidden="true">A<span>↗</span></span><span>AutoCare <strong>Insight</strong></span></Link>
        <nav aria-label="Product navigation"><a href="#platform">Platform</a><a href="#workflow">Workflow</a><a href="#inside">Inside the workshop</a></nav>
        <Link href="/login" className="button-outline product-signin">Sign in <ArrowUpRight size={15} /></Link>
      </header>
      <main id="product-main">
        <CinematicHero />
        <section id="workflow" className="workflow-section page-container">
          <div className="workflow-rail">{workflow.map((step, index) => <a key={step.title} href={`#step-${index}`} data-tone={['blue', 'orange', 'violet', 'emerald'][index]}><span>0{index + 1}</span>{step.title}<ArrowRight size={15} /></a>)}</div>
          <div className="workflow-details">{workflow.map((step, index) => <Reveal key={step.title} className="workflow-reveal" delay={index * motionTokens.stagger}><article id={`step-${index}`} data-tone={['blue', 'orange', 'violet', 'emerald'][index]}><step.icon size={23} /><p className="eyebrow">0{index + 1} / {step.title}</p><h2>{step.detail}</h2><p>{step.text}</p></article></Reveal>)}</div>
        </section>
        <ScrollWorkshop />
        <section id="inside" className="product-inside page-container">
          <Reveal><div className="section-heading"><div><p className="eyebrow">PURPOSE-BUILT FOR SERVICE TEAMS</p><h2>See the whole workshop.</h2></div><p>A focused workspace for the people<br className="desktop-break" /> who keep vehicles moving.</p></div></Reveal>
          <Reveal className="preview-reveal"><div className="workspace-preview" aria-label="Illustrative workspace preview with example records">
            <aside><span className="preview-brand"><Activity size={19} />AutoCare Insight</span>{[[Gauge,'Overview'],[CalendarDays,'Appointments'],[Car,'Vehicles'],[Wrench,'Workshop jobs'],[ClipboardCheck,'Repair reports'],[Package,'Parts & stock'],[Receipt,'Billing']].map(([Icon, name], index) => {const PreviewIcon = Icon as typeof Gauge; return <span className={index === 0 ? 'selected' : ''} key={String(name)}><PreviewIcon size={16} />{String(name)}</span>;})}</aside>
            <div className="preview-content"><div className="preview-heading"><h3>Workshop overview</h3><span><span className="status-dot" /> Sample workspace</span></div><div className="preview-metrics">{[[Car,'Vehicles','06'],[Wrench,'Active jobs','01'],[CalendarDays,'Appointments','03'],[Package,'Low stock','01']].map(([Icon,label,value]) => {const MetricIcon=Icon as typeof Car;return <div key={String(label)}><MetricIcon size={24} /><div><span>{String(label)}</span><strong>{String(value)}</strong></div></div>;})}</div><div className="preview-table-title">Service queue <span>Illustrative sample records</span></div><div className="preview-table-scroll"><table><thead><tr><th>Vehicle</th><th>Service</th><th>Status</th></tr></thead><tbody>{previewRows.map(row => <tr key={row[0]}><td><Car size={15} />{row[0]}</td><td>{row[1]}</td><td><span className={`preview-status ${row[2] === 'Completed' ? 'complete' : ''}`}>{row[2]}</span></td></tr>)}</tbody></table></div><div className="preview-bottom"><ShieldCheck size={13} /> Your workspace shows live records after sign-in.<Link href="/login">Open workspace <ArrowUpRight size={13} /></Link></div></div>
          </div></Reveal>
        </section>
        <section className="product-foundations page-container"><Reveal><div data-tone="blue"><ClipboardCheck size={30} /><h3>A clear handover.</h3><p>From booking to job card, keep vehicle details and service requests in context.</p></div></Reveal><Reveal delay={motionTokens.stagger}><div data-tone="violet"><Activity size={30} /><h3>Connected diagnostics.</h3><p>Link inspection findings to the work, parts and history behind every repair.</p></div></Reveal><Reveal delay={motionTokens.stagger * 2}><div data-tone="emerald"><Receipt size={30} /><h3>Confident settlement.</h3><p>Bring completed work, stock usage, invoices and payments together.</p></div></Reveal></section>
        <section className="product-cta page-container"><div><p className="eyebrow">THE NEXT SERVICE STARTS HERE</p><h2>Bring your workshop into focus.</h2></div><Link href="/login" className="button-primary">Enter the workspace <ArrowRight size={18} /></Link></section>
      </main>
      <footer className="product-footer page-container"><Link href="/" className="brand-lockup">AutoCare Insight</Link><span>Vehicle service, connected.</span><a href="https://github.com/ignite-2005/AutoCare-Insight" target="_blank" rel="noreferrer">Explore the project <ArrowUpRight size={14} /></a></footer>
    </div>
  );
}
