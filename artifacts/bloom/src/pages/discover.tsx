import { useEffect, useState } from 'react';
import { ArrowRight, Box, LoaderCircle, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'wouter';
import { Badge, Button, Card, EmptyState, Input, PageHeader } from '@/components/ui';
import { apiGet, type ApiError } from '@/services/api';
import { categories } from '@/services/demo-content';
import { useBloomState } from '@/hooks/use-bloom-state';

type Product = { id: string; title: string; description?: string; slug: string; category?: string; price_cents: number; shops?: { name?: string } };
export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tout');
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const { toast } = useBloomState();
  useEffect(() => {
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());
    if (category !== 'Tout') query.set('category', category);
    setState('loading');
    void apiGet<{ products: Product[] }>(`/products?${query.toString()}`).then((data) => { setProducts(data.products); setState('ready'); }).catch((cause: ApiError) => { setError(cause.message); setState('error'); });
  }, [search, category]);
  return <div className="content-wrap"><PageHeader eyebrow="Marketplace" title={<>Des créations à <em>rencontrer.</em></>} description="Découvre des produits numériques publiés par la communauté Bloom. Les résultats viennent du catalogue réel, jamais d’un chiffre inventé." action={<Button variant="outline" onClick={() => { setSearch(''); setCategory('Tout'); }}><SlidersHorizontal size={15} /> Réinitialiser</Button>} /><div className="discover-toolbar"><div className="input-wrap"><Search /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une ressource…" aria-label="Rechercher" /></div><span className="kicker" style={{ color: '#695e55' }}>{state === 'ready' ? `${products.length} résultat${products.length > 1 ? 's' : ''}` : 'Catalogue réel'}</span></div><div className="category-scroll" role="list" aria-label="Catégories"><button className={`category-pill ${category === 'Tout' ? 'active' : ''}`} onClick={() => setCategory('Tout')}>Tout</button>{categories.map((item) => <button key={item} className={`category-pill ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div>{state === 'loading' ? <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On ouvre les découvertes…</div> : state === 'error' ? <EmptyState title="Le catalogue se prépare" description={error} action={<Link href="/auth" className="button button-outline">Se connecter</Link>} /> : products.length ? <div className="product-grid">{products.map((product) => <Card className="product-card card-lift" key={product.id}><div className="product-cover cover-wine"><Badge tone="burgundy">{product.category || 'Produit'}</Badge><Box /></div><div className="product-info"><h3>{product.title}</h3><p>{product.description || 'Une ressource pour avancer à ton rythme.'}</p><div className="product-meta"><span className="product-author">par {product.shops?.name || 'Créateur Bloom'}</span><span className="price">{new Intl.NumberFormat('fr-FR').format(product.price_cents / 100)} XOF</span></div><Link href={`/product/${product.slug}`} className="button button-ghost">Voir le produit <ArrowRight size={13} /></Link></div></Card>)}</div> : <EmptyState title="Le catalogue attend ses premières créations." description="Aucun produit publié ne correspond à ta recherche pour le moment. Tu peux préparer le tien depuis l’espace Créer." action={<Link href="/create" className="button button-primary">Créer un produit</Link>} />}<div style={{ marginTop: 58, textAlign: 'center' }}><span className="kicker">Une marketplace qui grandit avec soin</span><p className="body-copy" style={{ fontSize: 13 }}>Chaque produit affiché ici correspondra à une vraie publication et à un vrai créateur.</p></div>{toast ? <div className="toast" role="status">{toast}</div> : null}</div>;
}