import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
import { Button, Input, Card, PageHeader, Toast } from '@/components/ui';
import { useBloomState } from '@/hooks/use-bloom-state';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify, toast } = useBloomState();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!email.trim() || !password.trim() || !displayName.trim()) {
        throw new Error('Tous les champs sont requis');
      }
      if (password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      // Mock registration (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store user in localStorage for demo
      const user = { id: `user_${Date.now()}`, email, displayName };
      localStorage.setItem('bloom_user', JSON.stringify(user));
      localStorage.setItem('bloom_token', `token_${user.id}`);

      notify('Inscription réussie! Redirection...');
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>
      <Card style={{ maxWidth: 420, width: '100%', padding: 32 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Créer un compte</h1>
          <p style={{ fontSize: 14, color: '#695e55', margin: 0 }}>Rejoins la communauté BLOOM</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#0d0d0d' }}>
              <User size={14} />
              Nom d'affichage
            </label>
            <Input
              type="text"
              placeholder="Ton nom ou surnom"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#0d0d0d' }}>
              <Mail size={14} />
              Email
            </label>
            <Input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#0d0d0d' }}>
              <Lock size={14} />
              Mot de passe
            </label>
            <Input
              type="password"
              placeholder="Au moins 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{ padding: 12, backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#991b1b' }}>
              {error}
            </div>
          )}

          <Button
            variant="primary"
            disabled={loading}
            style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'} {!loading && <ArrowRight size={16} />}
          </Button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}>
          Tu as déjà un compte? {' '}
          <a href="/login" style={{ color: '#a89860', fontWeight: 600, textDecoration: 'none' }}>Connexion</a>
        </div>
      </Card>
      <Toast message={toast} />
    </div>
  );
}
