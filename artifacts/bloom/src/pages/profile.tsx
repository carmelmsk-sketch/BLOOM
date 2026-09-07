import { FormEvent, useEffect, useState } from 'react';
import { Bookmark, Box, LoaderCircle, PenLine, Save, ShoppingBag, Store } from 'lucide-react';
import { Link } from 'wouter';
import { Badge, Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { apiGet, type ApiError, type Profile } from '@/services/api';
import { saveProfile, useAuth } from '@/hooks/use-auth';

type Tab = 'products' | 'purchases' | 'shop' | 'favorites';
type Product = { id: string; title: string; status?: string; price_cents?: number; slug?: string };
type Shop = { id: string; name: string; slug: string; status?: string };
const tabs: { id: Tab; label: string; icon: typeof Box }[] = [
  { id: 'products', label: 'Mes produits', icon: Box },
  { id: 'purchases', label: 'Mes achats', icon: ShoppingBag },
  { id: 'shop', label: 'Ma boutique', icon: Store },
  { id: 'favorites', label: 'Mes favoris', icon: Bookmark },
];

export default function ProfilePage() {
  const { profile, user, refresh } = useAuth();
  const [tab, setTab] = useState<Tab>('products');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: profile?.display_name ?? '', username: profile?.username ?? '', bio: profile?.bio ?? '', domain: profile?.domain ?? '', level: profile?.level ?? '', avatar_url: profile?.avatar_url ?? '' });
  const [data, setData] = useState<{ products: Product[]; shops: Shop[]; purchases: unknown[]; favorites: unknown[] }>({ products: [], shops: [], purchases: [], favorites: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setForm({ display_name: profile?.display_name ?? '', username: profile?.username ?? '', bio: profile?.bio ?? '', domain: profile?.domain ?? '', level: profile?.level ?? '', avatar_url: profile?.avatar_url ?? '' });
  }, [profile]);
  useEffect(() => {
    void Promise.all([
      apiGet<{ products: Product[] }>('/products?mine=true'),
      apiGet<{ shops: Shop[] }>('/shops/mine'),
      apiGet<{ orders: unknown[] }>('/orders/mine'),
      apiGet<{ favorites: unknown[] }>('/favorites'),
    ]).then(([products, shops, purchases, favorites]) => setData({ products: products.products, shops: shops.shops, purchases: purchases.orders, favorites: favorites.favorites })).catch((cause: ApiError) => setError(cause.message)).finally(() => setLoading(false));
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try { await saveProfile(form); await refresh(); setEditing(false); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Impossible de modifier ton profil.'); } finally { setSaving(false); }
  }
  const TabIcon = tabs.find((item) => item.id === tab)?.icon ?? Box;
  const activeItems = tab === 'products' ? data.products : tab === 'shop' ? data.shops : tab === 'purchases' ? data.purchases : data.favorites;
  return <div className="content-wrap"><PageHeader eyebrow="Ton espace" title={<>Ton profil, ton <em>chemin.</em></>} description="Les informations que tu partages ici servent à personnaliser ton expérience Bloom." action={<Button variant={editing ? 'outline' : 'primary'} onClick={() => setEditing(!editing)}><PenLine size={15} /> {editing ? 'Fermer' : 'Modifier le profil'}</Button>} /><Card className="profile-head fade-up"><div className="avatar avatar-large">{form.avatar_url ? <img src={form.avatar_url} alt="" /> : (form.display_name || user?.email || 'B').slice(0, 1).toUpperCase()}</div><div><h2>{form.display_name || 'Ton espace Bloom'}</h2><p>{form.bio || 'Ajoute une bio pour raconter ce que tu construis.'}</p><div className="profile-tags"><Badge tone="burgundy">{form.domain || 'Domaine à choisir'}</Badge><Badge tone="blue">{form.level || 'Niveau à choisir'}</Badge></div></div></Card>{editing && <Card className="profile-editor fade-up"><div className="section-title"><div><p className="kicker">Modifier</p><h2>Ce qui te représente</h2></div><Save size={18} color="#8b6d26" /></div><form onSubmit={submit} className="form-grid"><label>Nom affiché<input className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></label><label>Nom court<input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label><label className="full">Avatar URL<input className="input" type="url" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://…" /></label><label className="full">Bio<textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label><label>Domaine<input className="input" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} /></label><label>Niveau<input className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label><Button type="submit" variant="dark" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button></form></Card>}{error && <div className="form-status error">{error}</div>}<div className="profile-layout fade-up delay-1"><Card className="profile-section"><h3>Ton activité</h3><div className="profile-tabs">{tabs.map((item) => <button key={item.id} className={`profile-tab ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>{loading ? <div className="profile-loading"><LoaderCircle className="spin" size={20} /> Chargement…</div> : activeItems.length ? <div className="profile-items">{activeItems.map((item, index) => { const row = item as Product & Shop & { products?: Product; title?: string; name?: string }; return <div className="profile-item" key={String(row.id ?? index)}><TabIcon size={16} /><div><strong>{row.title || row.name || (row.products as Product | undefined)?.title || 'Élément Bloom'}</strong><span>{row.status || 'En préparation'}</span></div></div>; })}</div> : <EmptyState title={`Pas encore de ${tabs.find((item) => item.id === tab)?.label.toLowerCase()}.`} description="Cet espace se remplira avec tes actions réelles." action={tab === 'products' ? <Link href="/create" className="button button-primary">Créer un produit</Link> : undefined} />}</Card><div><div className="level-card"><div className="kicker" style={{ color: '#d9b965' }}>Ton niveau Bloom</div><h3>{profile?.level || 'En germination'}</h3><p>{profile?.onboarding_completed ? 'Ton parcours est personnalisé. Chaque action réelle fera évoluer cet espace.' : 'Complète ton onboarding pour personnaliser ton expérience.'}</p><div className="progress"><span style={{ width: profile?.onboarding_completed ? '100%' : '8%' }} /></div><div className="level-meta"><span>Ton chemin</span><span>{profile?.onboarding_completed ? 'Onboarding terminé' : 'À commencer'}</span></div></div><Card className="activity-card"><h3>Ton email</h3><div className="activity-row"><span>{user?.email}</span><strong>Compte actif</strong></div><Link href="/dashboard" className="button button-outline" style={{ marginTop: 14 }}>Ouvrir le dashboard</Link></Card></div></div></div>;
}