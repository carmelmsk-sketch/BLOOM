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
  return <div className="content-wrap">
    <PageHeader eyebrow="Ton espace" title="Profil" description="Un petit portrait de là où tu en es. Rien n’est figé, surtout pas toi." action={<Button variant="outline" onClick={() => notify('La personnalisation du profil arrive bientôt.')} data-testid="button-edit-profile"><PenLine size={15} /> Modifier</Button>} />
    <Card className="profile-head fade-up delay-1"><Avatar initials="B" large /><div><h2>Ton espace Bloom</h2><p>Les informations de ton profil apparaîtront ici quand tu seras prêt·e à les renseigner.</p><div className="profile-tags"><Badge tone="burgundy">Créateur·ice</Badge><Badge tone="blue">En exploration</Badge></div></div></Card>
    <div className="profile-layout fade-up delay-2">
      <Card className="profile-section"><h3>Ton activité</h3><div className="profile-tabs">{tabs.map((item) => <button key={item.id} className={`profile-tab ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)} data-testid={`button-profile-tab-${item.id}`}>{item.label}</button>)}</div><div className="profile-empty"><TabIcon size={25} /><div><strong>{tabInfo.label}</strong> sera bientôt un espace vivant.</div><p>Les données réelles seront connectées ici plus tard. Pour l’instant, tu peux déjà préparer ton premier projet.</p><Button variant="outline" onClick={() => notify(`La section « ${tabInfo.label} » est en préparation.`)} data-testid="button-profile-empty-action">En savoir plus</Button></div></Card>
      <div><div className="level-card"><div className="kicker" style={{ color: '#d9b965' }}>Ton niveau Bloom</div><h3>En germination</h3><p>Chaque question posée et chaque petit geste compte dans la construction de ton projet.</p><div className="progress"><span /></div><div className="level-meta"><span>Départ</span><span>38 / 100</span></div></div><Card className="activity-card"><h3>Les prochaines graines</h3><div className="activity-row"><span>Choisir un format</span><strong>À faire</strong></div><div className="activity-row"><span>Définir une idée</span><strong>À venir</strong></div><div className="activity-row"><span>Découvrir Bloom</span><strong>En cours</strong></div></Card></div>
    </div>
    <div style={{ marginTop: 19 }}><Button variant="dark" onClick={() => notify('Ton journal d’activité sera bientôt disponible.')} data-testid="button-profile-activity"><Heart size={15} /> Garder une trace de mes avancées</Button></div>
    <Toast message={toast} />
  </div>;
}