import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, User, Target, Compass } from 'lucide-react';
import { Button, Input, Card, PageHeader, Toast } from '@/components/ui';
import { useBloomState } from '@/hooks/use-bloom-state';

type OnboardingStep = 'welcome' | 'profile' | 'objective' | 'done';

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [username, setUsername] = useState('');
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const { notify, toast } = useBloomState();

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('bloom_user');
    if (!user) {
      window.location.href = '/register';
    }
  }, []);

  const handleNext = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    switch (step) {
      case 'welcome':
        setStep('profile');
        break;
      case 'profile':
        if (!username.trim()) {
          notify('Ton nom d\'utilisateur est requis');
          setLoading(false);
          return;
        }
        setStep('objective');
        break;
      case 'objective':
        if (!objective.trim()) {
          notify('Ton objectif est requis');
          setLoading(false);
          return;
        }
        // Save profile to localStorage
        const user = JSON.parse(localStorage.getItem('bloom_user') || '{}');
        localStorage.setItem('bloom_profile', JSON.stringify({
          username,
          objective,
          createdAt: new Date().toISOString(),
        }));
        notify('Bienvenue sur BLOOM!');
        setStep('done');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        break;
    }
    setLoading(false);
  };

  const handleSkip = () => {
    setStep('done');
    setTimeout(() => {
      window.location.href = '/';
    }, 800);
  };

  return (
    <div className="content-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>
      {step === 'welcome' && (
        <Card style={{ maxWidth: 500, width: '100%', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>+BLOOM</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px' }}>Bienvenue!</h1>
          <p style={{ fontSize: 16, color: '#695e55', margin: '0 0 32px', lineHeight: 1.6 }}>
            Ton espace pour apprendre, créer et vendre. Commençons par te connaître un peu mieux.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="outline" onClick={handleSkip} style={{ flex: 1 }}>Sauter</Button>
            <Button variant="primary" onClick={handleNext} style={{ flex: 1 }}>
              Commencer <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {step === 'profile' && (
        <Card style={{ maxWidth: 500, width: '100%', padding: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Ton identité</h2>
            <p style={{ fontSize: 14, color: '#695e55', margin: 0 }}>Comment veux-tu être connu(e)?</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#0d0d0d' }}>
                <User size={16} />
                Nom d'utilisateur
              </label>
              <Input
                type="text"
                placeholder="Ton identité créative"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0' }}>
                Visible aux autres créateurs
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="outline" onClick={() => setStep('welcome')} style={{ flex: 1 }} disabled={loading}>
                Retour
              </Button>
              <Button variant="primary" onClick={handleNext} style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Chargement...' : 'Suivant'} {!loading && <ArrowRight size={16} />}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 'objective' && (
        <Card style={{ maxWidth: 500, width: '100%', padding: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Ton objectif</h2>
            <p style={{ fontSize: 14, color: '#695e55', margin: 0 }}>Qu'est-ce qui t'amène ici?</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#0d0d0d' }}>
                <Target size={16} />
                Ton objectif
              </label>
              <textarea
                placeholder="Je veux créer... Je souhaite partager... J'ai envie de..."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid rgba(13, 13, 13, 0.1)',
                  borderRadius: 8,
                  fontSize: 14,
                  minHeight: 100,
                  fontFamily: 'var(--app-font-sans)',
                  resize: 'vertical',
                }}
              />
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0' }}>
                Cela nous aide à personnaliser ton expérience
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="outline" onClick={() => setStep('profile')} style={{ flex: 1 }} disabled={loading}>
                Retour
              </Button>
              <Button variant="primary" onClick={handleNext} style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Enregistrement...' : 'Terminer'} {!loading && <CheckCircle2 size={16} />}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 'done' && (
        <Card style={{ maxWidth: 500, width: '100%', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24, animation: 'fadeIn 0.6s ease-out' }}>🌱</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>C'est parti!</h1>
          <p style={{ fontSize: 16, color: '#695e55', margin: '0 0 24px', lineHeight: 1.6 }}>
            Ton espace BLOOM est prêt. Redirection en cours...
          </p>
        </Card>
      )}

      <Toast message={toast} />
    </div>
  );
}
