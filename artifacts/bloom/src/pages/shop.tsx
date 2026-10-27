import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Edit3, LoaderCircle, Plus, Store, X } from 'lucide-react';
import { Link } from 'wouter';
import { Badge, Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { apiGet, apiPatch, apiPost, type ApiError } from '@/services/api';

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  specialty?: string;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  facebook_url?: string | null;
  status?: string;
};

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  tagline: '',
  specialty: '',
  instagram_url: '',
  tiktok_url: '',
  facebook_url: '',
};

export default function ShopPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    void apiGet<{ shops: Shop[] }>('/shops/mine')
      .then((data) => setShops(data.shops))
      .catch((cause: ApiError) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  function edit(shop: Shop) {
    setEditingId(shop.id);
    setForm({
      name: shop.name,
      slug: shop.slug,
      description: shop.description ?? '',
      tagline: shop.tagline ?? '',
      specialty: shop.specialty ?? '',
      instagram_url: shop.instagram_url ?? '',
      tiktok_url: shop.tiktok_url ?? '',
      facebook_url: shop.facebook_url ?? '',
    });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const data = await apiPatch<{ shop: Shop }>(`/shops/${editingId}`, form);
        setShops((current) => current.map((shop) => shop.id === editingId ? data.shop : shop));
      } else {
        const data = await apiPost<{ shop: Shop }>('/shops', form);
        if (data.shop) setShops((current) => [data.shop, ...current]);
      }
      cancelEdit();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible d’enregistrer la boutique.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="Vendre"
        title={<>Ta boutique, ton <em>terrain.</em></>}
        description="Un espace simple pour présenter tes ressources et donner envie de commencer."
        action={<Link href="/create" className="button button-primary"><Plus size={15} /> Ajouter un produit</Link>}
      />
      {loading ? <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On cherche tes boutiques…</div> : (
        <div className="shop-layout">
          <div>
            {shops.length ? shops.map((shop) => (
              <Card key={shop.id} className="shop-card card-lift">
                <div className="shop-card-icon"><Store size={23} /></div>
                <div>
                  <Badge tone={shop.status === 'published' ? 'green' : 'demo'}>{shop.status === 'published' ? 'Publiée' : 'Brouillon'}</Badge>
                  <h2>{shop.name}</h2>
                  {shop.tagline && <p className="shop-tagline">{shop.tagline}</p>}
                  <p>{shop.description || 'Aucune description pour le moment.'}</p>
                  <Link href={`/shop/${shop.slug}`} className="button button-outline">Voir la boutique <ArrowRight size={14} /></Link>
                </div>
                <button className="icon-button" aria-label={`Modifier ${shop.name}`} onClick={() => edit(shop)}><Edit3 size={15} /></button>
              </Card>
            )) : <EmptyState title="Ta boutique est encore une graine." description="Crée ton premier espace de vente pour commencer à présenter tes produits." />}
          </div>
          <Card className="shop-form">
            <div className="section-title">
              <div>
                <p className="kicker">{editingId ? 'Modifier la boutique' : 'Première boutique'}</p>
                <h2>{editingId ? 'Affûte ta vitrine.' : 'Donne-lui un nom.'}</h2>
              </div>
              {editingId && <button className="icon-button" aria-label="Annuler la modification" onClick={cancelEdit}><X size={16} /></button>}
            </div>
            <p className="body-copy">Les informations visibles aident les visiteurs à comprendre ce que tu proposes.</p>
            {error && <div className="form-status error">{error}</div>}
            <form onSubmit={save} className="form-stack">
              <label>Nom<input className="input" required minLength={2} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex. Les ressources d’Ana" /></label>
              <label>Adresse courte<input className="input" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="ana-ressources" /></label>
              <label>Phrase d’accroche<input className="input" maxLength={180} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Des outils simples pour avancer." /></label>
              <label>Spécialité<input className="input" maxLength={120} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Création de contenu" /></label>
              <label>Description<textarea className="input" rows={4} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ce que tu proposes…" /></label>
              <label>Instagram<input className="input" type="url" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://instagram.com/..." /></label>
              <label>TikTok<input className="input" type="url" value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })} placeholder="https://tiktok.com/@..." /></label>
              <label>Facebook<input className="input" type="url" value={form.facebook_url} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} placeholder="https://facebook.com/..." /></label>
              <Button type="submit" variant="dark" disabled={saving}>{saving ? 'Enregistrement…' : editingId ? 'Enregistrer les changements' : 'Créer la boutique'} <ArrowRight size={15} /></Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}