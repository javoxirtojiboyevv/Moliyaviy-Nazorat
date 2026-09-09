import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

export function Metric({ label, value, hint, tone = 'default' }: { label: string; value: string; hint?: string; tone?: 'default' | 'good' | 'danger' }) {
  return <div className={`metric metric-${tone}`}><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="empty"><div className="empty-orb">◎</div><h3>{title}</h3><p>{text}</p>{action}</div>
}

export function LoadingState() {
  return <div className="loading-grid"><div className="skeleton big"/><div className="skeleton"/><div className="skeleton"/><div className="skeleton wide"/></div>
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return <div className="alert alert-danger">{message}</div>
}
