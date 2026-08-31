import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Edit3, LoaderCircle, Plus, Store } from 'lucide-react';
import { Link } from 'wouter';
import { Badge, Button, Card, EmptyState, Input, PageHeader } from '@/components/ui';
import { apiGet, apiPost, type ApiError } from '@/services/api';

type Shop = { id: string; name: string; slug: string; description?: string; status?: string };

export default function ShopPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [error, setError] = useState('');
  useEffect(() => { void apiGet<{ shops: Shop[] }>('/shops/mine').then((data) => setShops(data.shops)).catch((cause: ApiError) => setError(cause.message)).finally(() => setLoading(false)); }, []);
  async function create(event: FormEvent) {
    event.preventDefault(); setCreating(true); setError('');
    try { const data = await apiPost<{ shop: Shop }>('/shops', form); if (data.shop) setShops([data.shop, ...shops]); setForm({ name: '', slug: '', description: '' }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Impossible de créer la boutique.'); } finally { setCreating(false); }
  }
  return <div className="content-wrap"><PageHeader eyebrow="Vendre" title={<>Ta boutique, ton <em>terrain.</em></>} description="Un espace simple pour présenter tes ressources et donner envie de commencer." action={<Link href="/create" className="button button-primary"><Plus size={15} /> Ajouter un produit</Link>} />{loading ? <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On cherche tes boutiques…</div> : <div className="shop-layout"><div>{shops.length ? shops.map((shop) => <Card key={shop.id} className="shop-card card-lift"><div className="shop-card-icon"><Store size={23} /></div><div><Badge tone={shop.status === 'published' ? 'green' : 'demo'}>{shop.status === 'published' ? 'Publiée' : 'Brouillon'}</Badge><h2>{shop.name}</h2><p>{shop.description || 'Aucune description pour le moment.'}</p><Link href={`/shop/${shop.slug}`} className="button button-outline">Voir la boutique <ArrowRight size={14} /></Link></div><button className="icon-button" aria-label={`Modifier ${shop.name}`}><Edit3 size={15} /></button></Card>) : <EmptyState title="Ta boutique est encore une graine." description="Crée ton premier espace de vente pour commencer à présenter tes produits." />}</div><Card className="shop-form"><p className="kicker">Première boutique</p><h2>Donne-lui un nom.</h2><p className="body-copy">Tu pourras ajuster chaque détail plus tard.</p>{error && <div className="form-status error">{error}</div>}<form onSubmit={create} className="form-stack"><label>Nom<input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex. Les ressources d’Ana" /></label><label>Adresse courte<input className="input" required pattern="[a-zA-Z0-9-]+" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ana-ressources" /></label><label>Description<textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ce que tu proposes…" /></label><Button type="submit" variant="dark" disabled={creating}>{creating ? 'Création…' : 'Créer la boutique'} <ArrowRight size={15} /></Button></form></Card></div>}</div>;
}