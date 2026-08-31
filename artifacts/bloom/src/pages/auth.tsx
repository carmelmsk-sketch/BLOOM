import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, LoaderCircle, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { apiPost, type ApiError } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, refresh } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const next = new URLSearchParams(window.location.search).get('next') ?? '/profile';

  if (user) {
    navigate(next);
    return null;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const path = mode === 'signin' ? '/auth/signin' : '/auth/signup';
      const result = await apiPost<{ authenticated: boolean; requiresEmailConfirmation?: boolean }>(path, form);
      if (result.requiresEmailConfirmation) {
        setStatus({ type: 'success', message: 'Ton compte est créé. Vérifie ton email pour l’activer.' });
      } else {
        await refresh();
        navigate(next);
      }
    } catch (error) {
      const apiError = error as ApiError;
      setStatus({ type: 'error', message: apiError.message });
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="auth-page"><div className="auth-aside"><Link href="/" className="logo"><span className="logo-mark">+</span>BLOOM</Link><div className="auth-quote"><span className="kicker">Un espace pour avancer</span><h1>Les grandes idées commencent par un premier pas.</h1><p>Apprends, crée et construis quelque chose qui te ressemble.</p></div><span className="auth-signature">Apprends. Crée. Vends. Développe.</span></div><main className="auth-panel"><Link href="/" className="auth-back">Retour à l’accueil</Link><div className="auth-card"><div className="auth-icon"><Sparkles size={18} /></div><span className="kicker">{mode === 'signin' ? 'Bon retour' : 'Bienvenue dans Bloom'}</span><h2>{mode === 'signin' ? 'Ravi de te revoir.' : 'Ton espace commence ici.'}</h2><p className="body-copy">{mode === 'signin' ? 'Connecte-toi pour reprendre là où tu t’étais arrêté·e.' : 'Crée ton compte pour personnaliser ton chemin et donner une place à tes idées.'}</p><div className="auth-switch"><button className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Connexion</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Inscription</button></div>{status && <div className={`form-status ${status.type}`}>{status.message}</div>}<form onSubmit={submit} className="form-stack">{mode === 'signup' && <label>Ton prénom ou nom<input className="input" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Ex. Aïcha" /></label>}<label>Email<input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="toi@exemple.com" /></label><label>Mot de passe<div className="password-input"><input className="input" type={showPassword ? 'text' : 'password'} minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8 caractères minimum" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label><button className="button button-primary form-submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={16} /> : <ArrowRight size={16} />}{submitting ? 'Un instant…' : mode === 'signin' ? 'Entrer dans Bloom' : 'Créer mon espace'}</button></form></div></main></div>;
}