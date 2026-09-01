import { useState } from 'react';
import { Bookmark, Box, Heart, PenLine, ShoppingBag, Sparkles } from 'lucide-react';
import { Button, Card, Avatar, Badge, PageHeader, Toast } from '@/components/ui';
import { useBloomState } from '@/hooks/use-bloom-state';

const tabs = [
  { id: 'products', label: 'Mes produits', icon: Box },
  { id: 'purchases', label: 'Mes achats', icon: ShoppingBag },
  { id: 'shop', label: 'Ma boutique', icon: Sparkles },
  { id: 'favorites', label: 'Mes favoris', icon: Bookmark },
];

export default function ProfilePage() {
  const [tab, setTab] = useState('products');
  const { notify, toast } = useBloomState();
  const tabInfo = tabs.find((item) => item.id === tab) ?? tabs[0];
  const TabIcon = tabInfo.icon;
  
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bloom_user') || '{}') : {};
  const profile = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bloom_profile') || '{}') : {};

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="Ton espace"
        title="Profil"
        description="Un petit portrait de là où tu en es. Rien n'est figé, surtout pas toi."
        action={
          <Button variant="outline" onClick={() => notify('Édition du profil bientôt disponible')} data-testid="button-profile-edit">
            <PenLine size={14} /> Éditer
          </Button>
        }
      />
      <Card className="profile-head fade-up delay-1">
        <Avatar initials={user.displayName?.charAt(0).toUpperCase() || 'U'} large />
        <div>
          <h2>{user.displayName || 'Ton profil'}</h2>
          <p>
            {profile.objective || 'Les informations de ton profil apparaîtront ici quand tu seras prêt·e à les renseigner.'}
          </p>
        </div>
      </Card>
      <div className="profile-layout fade-up delay-2">
        <Card className="profile-section">
          <h3>Ton activité</h3>
          <div className="profile-tabs">
            {tabs.map((item) => (
              <button
                key={item.id}
                className={`profile-tab ${tab === item.id ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
                data-testid={`button-profile-tab-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 24, textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <TabIcon size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>Aucun élément pour le moment dans cette section.</p>
            {tab === 'products' && (
              <Button variant="primary" onClick={() => window.location.href = '/create'} style={{ marginTop: 12 }}>
                Créer mon premier produit
              </Button>
            )}
          </div>
        </Card>
        <div>
          <div className="level-card">
            <div className="kicker" style={{ color: '#d9b965' }}>Ton niveau Bloom</div>
            <h3>En germination</h3>
            <p>
              Chaque question posée et chaque petit geste compte dans ton parcours. Tu avances déjà.
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge tone="blue">1 question posée</Badge>
              <Badge tone="green">Profil complété</Badge>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 19 }}>
        <Button
          variant="dark"
          onClick={() => notify('Ton journal d\'activité sera bientôt disponible.')}
          data-testid="button-profile-activity"
        >
          <Heart size={15} /> Garder une trace de mes progrès
        </Button>
      </div>
      <Toast message={toast} />
    </div>
  );
}
