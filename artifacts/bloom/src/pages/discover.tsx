import { useMemo, useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'wouter';
import { Badge, Button, Card, EmptyState, Input, LoadingState, PageHeader, Toast } from '@/components/ui';
import { categories, demoProducts } from '@/services/demo-content';
import type { Category } from '@/types';
import { useBloomState } from '@/hooks/use-bloom-state';

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'Tout' | Category>('Tout');
  const [loading, setLoading] = useState(false);
  const { notify, toast } = useBloomState();
  const results = useMemo(() => demoProducts.filter((product) => {
    const matchesCategory = category === 'Tout' || product.category === category;
    const query = search.trim().toLowerCase();
    return matchesCategory && (!query || `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(query));
  }), [category, search]);
  const refreshDemo = () => { setLoading(true); window.setTimeout(() => setLoading(false), 500); };

  return <div className="content-wrap">
    <PageHeader eyebrow="Découvrir" title="Des idées à rencontrer." description="Explore des ressources pensées par la communauté. Tout ce que tu vois ici est du contenu de démonstration, en attendant l’ouverture de la marketplace Bloom." action={<Button variant="outline" onClick={refreshDemo} data-testid="button-refresh-discover"><SlidersHorizontal size={15} /> Affiner</Button>} />
    <div className="discover-toolbar"><div className="input-wrap"><Search /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une ressource, un sujet..." aria-label="Rechercher" data-testid="input-discover-search" /></div><span className="kicker" style={{ color: '#695e55' }}>{results.length} résultat{results.length > 1 ? 's' : ''}</span></div>
    <div className="category-scroll" role="list" aria-label="Catégories">{categories.map((item) => <button key={item} className={`category-pill ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)} data-testid={`button-category-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div>
    <div className="demo-note" data-testid="status-demo-content"><strong>Contenu de démonstration.</strong> Ces produits illustrent l’expérience de découverte. Aucun achat ni catalogue réel n’est connecté.</div>
    {loading ? <LoadingState /> : results.length > 0 ? <div className="product-grid" data-testid="list-demo-products">{results.map((product) => { const Icon = product.icon; return <Card className="product-card card-lift" key={product.id} data-testid={`card-product-${product.id}`}><div className={`product-cover cover-${product.cover}`}><Badge tone="demo">Démo</Badge><Icon /></div><div className="product-info"><Badge tone={product.cover === 'wine' ? 'burgundy' : product.cover === 'blue' ? 'blue' : product.cover === 'green' ? 'green' : product.cover === 'pink' ? 'pink' : 'demo'}>{product.category}</Badge><h3>{product.title}</h3><p>{product.description}</p><div className="product-meta"><span className="product-author">par {product.author}</span><span className="price">{product.price}</span></div><Button variant="ghost" onClick={() => notify(`Aperçu de « ${product.title} » — bientôt disponible.`)} data-testid={`button-preview-${product.id}`}>Voir l’aperçu <ArrowRight size={13} /></Button></div></Card>; })}</div> : <EmptyState title="On prépare les prochaines découvertes." description="Aucun contenu ne correspond à ta recherche pour le moment. Quand la marketplace sera connectée, tu retrouveras ici des créations faites pour avancer." action={<><Button variant="outline" onClick={() => { setSearch(''); setCategory('Tout'); }} data-testid="button-reset-discover">Réinitialiser la recherche</Button><Link href="/create" className="button button-primary" style={{ marginLeft: 8 }} data-testid="link-empty-create">Créer le tien</Link></>} />}
    <div style={{ marginTop: 58, textAlign: 'center' }}><span className="kicker">La suite arrive ici</span><p className="body-copy" style={{ fontSize: 13 }}>Bientôt, un espace vivant pour apprendre des autres et trouver les bons outils au bon moment.</p></div>
    <Toast message={toast} />
  </div>;
}