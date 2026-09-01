import React, { useState } from 'react';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { Button, Input, Card, Toast } from '@/components/ui';
import { useBloomState } from '@/hooks/use-bloom-state';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify, toast } = useBloomState();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Email et mot de passe requis');
      }

      // Mock login (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store user in localStorage for demo
      const user = { id: `user_${Date.now()}`, email, displayName: email.split('@')[0] };
      localStorage.setItem('bloom_user', JSON.stringify(user));
      localStorage.setItem('bloom_token', `token_${user.id}`);

      notify('Connexion réussie!');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la connexion';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>
      <Card style={{ maxWidth: 420, width: '100%', padding: 32 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Connexion</h1>
          <p style={{ fontSize: 14, color: '#695e55', margin: 0 }}>Retrouve ton espace BLOOM</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              placeholder="Ton mot de passe"
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
            {loading ? 'Connexion en cours...' : 'Se connecter'} {!loading && <ArrowRight size={16} />}
          </Button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}>
          Tu n'as pas de compte? {' '}
          <a href="/register" style={{ color: '#a89860', fontWeight: 600, textDecoration: 'none' }}>S'inscrire</a>
        </div>
      </Card>
      <Toast message={toast} />
    </div>
  );
}
