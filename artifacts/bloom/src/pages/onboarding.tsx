import { FormEvent, useState } from 'react';
import { ArrowRight, Check, Sprout } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button, Card, PageHeader } from '@/components/ui';
import { saveProfile, useAuth } from '@/hooks/use-auth';

const goals = ['Créer mon premier produit', 'Développer mon activité', 'Apprendre une compétence', 'Clarifier une idée'];
const domains = ['Business', 'Marketing', 'Design', 'IA', 'Éducation', 'Création de contenu'];
const levels = ['Je découvre', 'Je me lance', 'Je suis déjà en activité'];

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { profile, refresh } = useAuth();
  const [form, setForm] = useState({ onboarding_goal: profile?.onboarding_goal ?? '', domain: profile?.domain ?? '', level: profile?.level ?? '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.onboarding_goal || !form.domain || !form.level) { setError('Choisis une réponse dans chaque étape pour continuer.'); return; }
    setSaving(true); setError('');
    try { await saveProfile({ ...form, onboarding_completed: true }); await refresh(); navigate('/dashboard'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Impossible d’enregistrer ton profil.'); }
    finally { setSaving(false); }
  }
  return <div className="content-wrap onboarding-page"><PageHeader eyebrow="Première pousse" title={<>On part de <em>toi.</em></>} description="Quelques réponses pour que Bloom te propose un chemin qui te ressemble. Tu pourras tout modifier plus tard." /><form onSubmit={submit} className="onboarding-form"><Card className="onboarding-card"><div className="onboarding-step"><span>01</span><div><p className="kicker">Ton intention</p><h2>Qu’est-ce qui t’amène ici ?</h2><div className="choice-grid">{goals.map((goal) => <button type="button" key={goal} className={`choice ${form.onboarding_goal === goal ? 'selected' : ''}`} onClick={() => setForm({ ...form, onboarding_goal: goal })}>{form.onboarding_goal === goal && <Check size={15} />}{goal}</button>)}</div></div></div><div className="onboarding-step"><span>02</span><div><p className="kicker">Ton terrain</p><h2>Dans quel domaine tu veux avancer ?</h2><div className="choice-grid">{domains.map((domain) => <button type="button" key={domain} className={`choice ${form.domain === domain ? 'selected' : ''}`} onClick={() => setForm({ ...form, domain })}>{form.domain === domain && <Check size={15} />}{domain}</button>)}</div></div></div><div className="onboarding-step"><span>03</span><div><p className="kicker">Ton niveau</p><h2>Où en es-tu aujourd’hui ?</h2><div className="choice-grid">{levels.map((level) => <button type="button" key={level} className={`choice ${form.level === level ? 'selected' : ''}`} onClick={() => setForm({ ...form, level })}>{form.level === level && <Check size={15} />}{level}</button>)}</div></div></div>{error && <div className="form-status error">{error}</div>}<Button type="submit" variant="primary" disabled={saving}>{saving ? 'On enregistre…' : 'Entrer dans mon espace'} <ArrowRight size={15} /></Button></Card><div className="onboarding-aside"><div className="onboarding-seed"><Sprout size={22} /><p className="kicker">Ici, pas de parcours imposé</p><h3>On avance avec ce qui est déjà là.</h3><p>Ton expérience se construira au fil de tes actions réelles : une leçon terminée, un produit préparé, une idée clarifiée.</p></div></div></form></div>;
}