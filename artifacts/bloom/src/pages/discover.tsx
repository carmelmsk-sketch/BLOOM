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

  const results = useMemo(() =>
    demoProducts.filter((product) => {
      const matchesCategory = category === 'Tout' || product.category === category;
      const query = search.trim().toLowerCase();
      return (
        matchesCategory &&
        (!query ||
          `${product.title} ${product.description} ${product.category}`
            .toLowerCase()
            .includes(query))
      );
    }),
    [category, search]
  );

  const refreshDemo = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="Découvrir"
        title="Des idées à rencontrer."
        description="Explore des ressources pensées par la communauté. Tout ce que tu vois ici est du contenu de démonstration, en attente d'une vraie base de données."
      />
      <div className="discover-toolbar">
        <div className="input-wrap">
          <Search />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une ressource, un sujet..."
            data-testid="input-discover-search"
          />
        </div>
      </div>
      <div className="category-scroll" role="list" aria-label="Catégories">
        {categories.map((item) => (
          <button
            key={item}
            className={`category-pill ${category === item ? 'active' : ''}`}
            onClick={() => setCategory(item)}
            data-testid={`button-category-${item.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="demo-note" data-testid="status-demo-content">
        <strong>Contenu de démonstration.</strong> Ces produits illustrent
        l'expérience de découverte. Aucun achat ni catalogue réel n'est actuellement
        en place.
      </div>
      {loading ? (
        <LoadingState />
      ) : results.length > 0 ? (
        <div className="product-grid" data-testid="list-demo-products">
          {results.map((product) => {
            const Icon = product.icon;
            return (
              <Card
                key={product.id}
                className="card-lift"
                style={{ cursor: 'pointer', overflow: 'hidden' }}
                onClick={() =>
                  notify(`${product.title} — bientôt disponible en vrai catalogue`)
                }
                data-testid={`card-product-${product.id}`}
              >
                <div
                  style={{
                    height: 100,
                    background: `linear-gradient(135deg, var(--color-${product.cover}), var(--color-${product.cover}))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Icon size={32} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
                  {product.title}
                </h3>
                <p style={{ fontSize: 13, color: '#695e55', margin: '0 0 12px' }}>
                  {product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge>{product.category}</Badge>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(13, 13, 13, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13,
                  }}
                >
                  <small style={{ color: '#9ca3af' }}>par {product.author}</small>
                  <strong style={{ color: '#a89860' }}>{product.price}</strong>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Aucun résultat"
          description={`Pas de produit trouvé pour "${search}" dans la catégorie ${category}.`}
          action={
            <button
              onClick={() => {
                setSearch('');
                setCategory('Tout');
              }}
              style={{
                marginTop: 12,
                padding: '8px 16px',
                border: '1px solid #a89860',
                borderRadius: 8,
                background: 'transparent',
                color: '#a89860',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Réinitialiser les filtres
            </button>
          }
        />
      )}
      <div style={{ marginTop: 58, textAlign: 'center' }}>
        <span className="kicker">La suite arrive ici</span>
        <p className="body-copy" style={{ fontSize: 13 }}>
          Bientôt, un espace vivant pour apprendre ensemble. Et acheter aussi.
        </p>
      </div>
      <Toast message={toast} />
    </div>
  );
}
