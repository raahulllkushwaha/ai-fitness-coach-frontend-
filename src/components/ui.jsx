import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, RefreshCw } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}

export function GlassCard({ children, className = '', ...props }) {
  return <div className={`glass-card ${className}`} {...props}>{children}</div>;
}

export function StatCard({ label, value, unit, icon: Icon = Activity, accent = 'lime', trend, delay = 0 }) {
  const cardRef = useRef(null);
  useEffect(() => {
    if (cardRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, delay, ease: 'power2.out' });
    }
  }, [delay]);
  return (
    <div ref={cardRef} className={`stat-card accent-${accent}`}>
      <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div>
      <div className="stat-value">{value ?? '—'}{unit && <small>{unit}</small>}</div>
      {trend && <p className="stat-footnote">{trend}</p>}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', loading = false, block = false, className = '', ...props }) {
  return (
    <button className={`button button-${variant} button-${size} ${block ? 'button-block' : ''} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <RefreshCw size={15} className="spin" />}
      {children}
    </button>
  );
}

export function Input({ label, error, hint, ...props }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <input className={`input ${error ? 'input-error' : ''}`} {...props} />
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <select className={`input select-input ${error ? 'input-error' : ''}`} {...props}>{children}</select>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function LoadingBlock({ label = 'Loading your data…' }) {
  return <div className="loading-block"><span className="loader" /><span>{label}</span></div>;
}

export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="error-block">
      <AlertTriangle size={19} />
      <div><strong>Couldn’t load this section</strong><p>{message}</p></div>
      {onRetry && <Button variant="ghost" size="sm" onClick={onRetry}><RefreshCw size={14} /> Retry</Button>}
    </div>
  );
}

export function EmptyState({ icon: Icon = Activity, title, description, action }) {
  return <motion.div className="empty-state" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span className="empty-icon"><Icon size={22} /></span><h3>{title}</h3><p>{description}</p>{action}</motion.div>;
}

export function SectionTitle({ title, subtitle, action }) {
  return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}

export function Modal({ title, description, onClose, children }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <motion.div className="modal-panel" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
        <div className="modal-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">×</button></div>
        {children}
      </motion.div>
    </div>
  );
}
