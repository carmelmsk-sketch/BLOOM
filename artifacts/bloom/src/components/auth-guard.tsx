import { type ReactNode } from 'react';
import { Link, Redirect, useLocation } from 'wouter';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function AuthLoading() {
  return <div className="content-wrap auth-loading"><LoaderCircle className="spin" size={26} /><p>On prépare ton espace…</p></div>;
}

export function ProtectedRoute({ children, onboarding = true }: { children: ReactNode; onboarding?: boolean }) {
  const { user, profile, schemaReady, loading } = useAuth();
  const [location] = useLocation();
  if (loading) return <AuthLoading />;
  if (!user) return <Redirect to={`/auth?next=${encodeURIComponent(location)}`} />;
  if (onboarding && schemaReady && profile && !profile.onboarding_completed && location !== '/onboarding') {
    return <Redirect to="/onboarding" />;
  }
  return <>{children}</>;
}

export function AuthRequiredCard({ title = 'Ton espace est privé.' }: { title?: string }) {
  return <div className="empty-state auth-required-card"><div className="empty-state-icon"><LockKeyhole size={22} /></div><h3>{title}</h3><p>Connecte-toi pour retrouver tes produits, tes favoris et tes prochaines étapes.</p><Link href="/auth" className="button button-primary">Se connecter</Link></div>;
}