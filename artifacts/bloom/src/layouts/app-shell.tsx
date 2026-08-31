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
  Bell,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/', label: 'Accueil', icon: House },
  { href: '/discover', label: 'Découvrir', icon: Compass },
  { href: '/create', label: 'Créer', icon: Plus },
  { href: '/academy', label: 'Academy', icon: BookOpen },
  { href: '/coach', label: 'Bloom Coach', icon: MessageCircle },
  { href: '/activity', label: 'Activité', icon: Activity },
  { href: '/profile', label: 'Profil', icon: UserRound,
  Bell,
  Menu },
];

const mobileItems = [
  { href: '/', label: 'Accueil', icon: House },
  { href: '/discover', label: 'Découvrir', icon: Compass },
  { href: '/activity', label: 'Activité', icon: Activity },
  { href: '/profile', label: 'Profil', icon: UserRound,
  Bell,
  Menu },
];

function Brand() {
  return <span className="logo"><span className="logo-mark">+</span>BLOOM</span>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const currentLabel = navItems.find((item) => item.href === location)?.label ?? 'BLOOM';

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
          <div className="side-note"><strong>Ton prochain projet commence ici.</strong>Un espace pour apprendre, créer et avancer à ton rythme.</div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div><span className="kicker">Espace créateur</span><div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{currentLabel}</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Link href="/notifications" className="icon-button" aria-label="Notifications"><Bell size={16} /></Link><span className="kicker" style={{ color: '#695e55' }}>{user ? (profile?.display_name ?? user.email ?? 'Mon espace') : 'Espace public'}</span><Link href={user ? '/profile' : '/auth'} className="avatar" data-testid="img-avatar-top">{profile?.display_name?.slice(0, 1).toUpperCase() ?? user?.email?.slice(0, 1).toUpperCase() ?? 'B'}</Link></div>
        </header>
        <header className="mobile-topbar">
          <Link href="/" className="brand-lockup" style={{ padding: 0 }} data-testid="link-mobile-brand"><Brand /></Link>
          <button className="icon-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} data-testid="button-mobile-menu">{menuOpen ? <X /> : <Menu />}</button>
        </header>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {navItems.filter((item) => item.href !== '/create').map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-menu-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</Link>)}
          {user ? <button className="mobile-menu-signout" onClick={() => { void signOut(); setMenuOpen(false); }}>Se déconnecter</button> : <Link href="/auth" onClick={() => setMenuOpen(false)}>Se connecter</Link>}
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