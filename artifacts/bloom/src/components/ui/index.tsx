import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';

type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode };

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = '', ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props}>{children}</div>;
}

export function Badge({ children, tone = 'demo' }: { children: ReactNode; tone?: 'demo' | 'burgundy' | 'blue' | 'green' | 'pink' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${className}`} {...props} />;
}

export function Avatar({ initials, large = false }: { initials: string; large?: boolean }) {
  return <div className={`avatar ${large ? 'avatar-large' : ''}`} data-testid="img-avatar">{initials}</div>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: ReactNode; description: string; action?: ReactNode }) {
  return <div className="page-header fade-up"><div><div className="kicker">{eyebrow}</div><h1 className="display">{title}</h1><p className="body-copy">{description}</p></div>{action}</div>;
}

export function LoadingState() {
  return <div className="product-grid" aria-label="Chargement" data-testid="status-loading">{[1, 2, 3].map((item) => <div className="card" key={item} style={{ padding: 18 }}><div className="skeleton" style={{ height: 140 }} /><div className="skeleton" style={{ height: 20, marginTop: 16, width: '72%' }} /><div className="skeleton" style={{ height: 12, marginTop: 9, width: '90%' }} /></div>)}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state" data-testid="status-empty"><div className="empty-state-icon" aria-hidden="true">+</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function Modal({ title, description, children, onClose }: { title: string; description: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true"><div className="modal-head"><div><h2>{title}</h2><p>{description}</p></div><button className="icon-button" aria-label="Fermer" data-testid="button-close-modal" onClick={onClose}><X /></button></div>{children}</div></div>;
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="toast" role="status" data-testid="status-toast">{message}</div>;
}