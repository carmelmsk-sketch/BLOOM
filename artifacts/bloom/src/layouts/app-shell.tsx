import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Activity,
  BookOpen,
  Compass,
  House,
  Menu,
  MessageCircle,
  Plus,
  UserRound,
  X,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Accueil', icon: House },
  { href: '/discover', label: 'Découvrir', icon: Compass },
  { href: '/create', label: 'Créer', icon: Plus },
  { href: '/academy', label: 'Academy', icon: BookOpen },
  { href: '/coach', label: 'Bloom Coach', icon: MessageCircle },
  { href: '/activity', label: 'Activité', icon: Activity },
  { href: '/profile', label: 'Profil', icon: UserRound },
];

const mobileItems = [
  { href: '/', label: 'Accueil', icon: House },
  { href: '/discover', label: 'Découvrir', icon: Compass },
  { href: '/activity', label: 'Activité', icon: Activity },
  { href: '/profile', label: 'Profil', icon: UserRound },
];

function Brand() {
  return <span className="logo"><span className="logo-mark">+</span>BLOOM</span>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLabel = navItems.find((item) => item.href === location)?.label ?? 'BLOOM';
  const user = localStorage.getItem('bloom_user') ? JSON.parse(localStorage.getItem('bloom_user')!) : null;

  const handleLogout = () => {
    localStorage.removeItem('bloom_user');
    localStorage.removeItem('bloom_token');
    localStorage.removeItem('bloom_profile');
    window.location.href = '/login';
  };

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar" aria-label="Navigation principale">
        <Link href="/" className="brand-lockup" data-testid="link-brand"><Brand /></Link>
        <div className="sidebar-rule" />
        <div className="side-label">Ton espace</div>
        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={location === item.href ? 'active' : ''} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>
              <Icon /><span>{item.label}</span>
            </Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          {user && (
            <>
              <div className="side-note"><strong>{user.displayName}</strong><br /><small style={{ color: '#9ca3af' }}>{user.email}</small></div>
              <button 
                onClick={handleLogout}
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '8px 12px',
                  border: '1px solid rgba(244, 240, 232, 0.2)',
                  borderRadius: 8,
                  background: 'transparent',
                  color: '#f4f0e8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244, 240, 232, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
                data-testid="button-logout"
              >
                <LogOut size={12} /> Déconnexion
              </button>
            </>
          )}
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div><span className="kicker">Espace créateur</span><div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{currentLabel}</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user && <span className="kicker" style={{ color: '#695e55' }}>{user.displayName}</span>}
            <div className="avatar" data-testid="img-avatar">{user?.displayName?.charAt(0).toUpperCase() || 'U'}</div>
          </div>
        </header>
        <header className="mobile-topbar">
          <Link href="/" className="brand-lockup" style={{ padding: 0 }} data-testid="link-mobile-brand"><Brand /></Link>
          <button className="icon-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} data-testid="button-mobile-menu">{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </header>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {navItems.filter((item) => item.href !== '/create').map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-menu-${item.label.toLowerCase().replaceAll(' ', '-')}`} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(13, 13, 13, 0.05)' }}>{item.label}</Link>)}
          {user && <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }} data-testid="button-mobile-logout"><LogOut size={16} /> Déconnexion</button>}
        </div>
        <main>{children}</main>
        <nav className="mobile-nav" aria-label="Navigation mobile">
          <Link href="/" className={location === '/' ? 'active' : ''} data-testid="link-mobile-home"><House /><span>Accueil</span></Link>
          <Link href="/discover" className={location === '/discover' ? 'active' : ''} data-testid="link-mobile-discover"><Compass /><span>Découvrir</span></Link>
          <Link href="/create" className="mobile-create" aria-label="Créer un projet" data-testid="link-mobile-create"><Plus /><span>Créer</span></Link>
          {mobileItems.slice(2).map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={location === item.href ? 'active' : ''} data-testid={`link-mobile-${item.label.toLowerCase()}`}><Icon /><span>{item.label}</span></Link>; })}
        </nav>
      </div>
    </div>
  );
}
