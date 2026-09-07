import { FormEvent, useState } from 'react';
import { ArrowRight, Check, CircleHelp, LoaderCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button, Card, Input, PageHeader, Toast } from '@/components/ui';
import { creationTypes, categories } from '@/services/demo-content';
import { apiPost, type ApiError } from '@/services/api';
import { useBloomState } from '@/hooks/use-bloom-state';

const typeMap: Record<string, string> = { ebook: 'ebook', formation: 'formation', pack: 'pack', template: 'template', guide: 'guide', other: 'other' };
export default function CreatePage() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'Création de contenu', price: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { notify, toast } = useBloomState();
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !form.title.trim()) { setError('Choisis un format et donne un titre à ton produit.'); return; }
    setSaving(true); setError('');
    try {
      const result = await apiPost<{ product: { id: string } }>('/products', { title: form.title, description: form.description, category: form.category, product_type: typeMap[selected] ?? 'other', price_cents: Math.max(0, Math.round(Number(form.price || 0) * 100)) });
      notify('Ton produit a été enregistré en brouillon.'); navigate(`/dashboard?product=${result.product?.id ?? ''}`);
    } catch (cause) { const apiError = cause as ApiError; setError(apiError.message); }
    finally { setSaving(false); }
  }
  return <div className="content-wrap"><PageHeader eyebrow="Créer" title={<>Qu’est-ce que tu veux <em>créer ?</em></>} description="Commence simplement. Ton produit sera enregistré en brouillon : tu gardes le temps de le travailler avant de le publier." action={<Link href="/dashboard" className="button button-ghost">Mon dashboard <ArrowRight size={15} /></Link>} /><div className="create-grid fade-up delay-1">{creationTypes.map((type) => { const Icon = type.icon; return <Card key={type.id} className={`create-card card-lift ${selected === type.id ? 'selected' : ''}`} onClick={() => setSelected(type.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelected(type.id); }}><div className="create-icon"><Icon size={19} /></div><h3>{type.title}</h3><p>{type.description}</p>{selected === type.id && <Check size={16} style={{ position: 'absolute', bottom: 18, right: 18, color: '#8b6d26' }} />}</Card>; })}</div>{selected && <Card className="product-editor fade-up"><div className="section-title"><div><p className="kicker">Brouillon</p><h2>Donne une première forme à ton idée.</h2></div><span className="badge badge-demo">Non publié</span></div>{error && <div className="form-status error">{error}</div>}<form onSubmit={submit} className="form-grid"><label className="full">Titre<input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex. Les bases du contenu utile" /></label><label className="full">Description<textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="À qui s’adresse ce produit ? Qu’est-ce qu’il permet de faire ?" /></label><label>Catégorie<select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Prix indicatif (XOF)<Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" /></label><div className="full form-actions"><Button type="submit" variant="primary" disabled={saving}>{saving ? <LoaderCircle className="spin" size={16} /> : <ArrowRight size={16} />}{saving ? 'Enregistrement…' : 'Enregistrer le brouillon'}</Button><span className="body-copy small">Tu pourras ajouter ton fichier et publier depuis ton espace vendeur.</span></div></form></Card>}<div className="card fade-up delay-3 create-help"><CircleHelp size={19} color="#8b6d26" /><p><strong>Pas encore sûr·e ?</strong> Bloom Coach peut t’aider à faire émerger le bon format.</p><Link href="/coach" className="button button-outline">Demander à Bloom</Link></div><Toast message={toast} /></div>;
}