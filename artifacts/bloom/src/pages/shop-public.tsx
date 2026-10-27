import { useEffect, useState } from 'react';
import { ArrowLeft, Box, Instagram, LoaderCircle, Store } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { Badge, Card, EmptyState } from '@/components/ui';
import { apiGet } from '@/services/api';

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
};
type Product = {
  id: string;
  title: string;
  description?: string;
  slug: string;
  price_cents: number;
  promo_price_cents?: number | null;
  currency: string;
  cover_url?: string | null;
  category?: string;
};

function money(cents: number, currency: string) {
  return `${new Intl.NumberFormat('fr-FR').format(cents / 100)} ${currency}`;
}

export default function ShopPublicPage() {
  const [, params] = useRoute('/shop/:slug');
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!params?.slug) return;
    void apiGet<{ shop: Shop }>(`/shops/${params.slug}`)
      .then((data) => {
        setShop(data.shop);
        return apiGet<{ products: Product[] }>(`/products?shop=${encodeURIComponent(data.shop.id)}`);
      })
      .then((data) => setProducts(data.products))
      .catch(() => setState('error'))
      .finally(() => setState((current) => current === 'error' ? current : 'ready'));
  }, [params?.slug]);

  if (state === 'loading') return <div className="content-wrap"><div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On ouvre la boutique…</div></div>;
  if (state === 'error' || !shop) return <div className="content-wrap"><EmptyState title="Cette boutique n’est pas disponible" description="Elle est peut-être encore en préparation ou son adresse a changé." action={<Link href="/discover" className="button button-primary"><ArrowLeft size={15} /> Revenir à Découvrir</Link>} /></div>;

  return (
    <div className="content-wrap public-shop">
      <Link href="/discover" className="button button-ghost"><ArrowLeft size={15} /> Découvrir</Link>
      <div className="public-shop-head">
        <div className="shop-avatar"><Store size={27} /></div>
        <p className="kicker">Boutique Bloom</p>
        <h1>{shop.name}</h1>
        {shop.tagline && <p className="shop-tagline">{shop.tagline}</p>}
        <p>{shop.description || 'Une boutique portée par une idée.'}</p>
        {shop.specialty && <Badge tone="green">{shop.specialty}</Badge>}
        <div className="shop-socials">
          {shop.instagram_url && <a href={shop.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={16} /></a>}
          {shop.tiktok_url && <a href={shop.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok">TikTok</a>}
          {shop.facebook_url && <a href={shop.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook">Facebook</a>}
        </div>
      </div>
      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <Card key={product.id} className="product-card card-lift">
              <div className="product-cover cover-wine">
                {product.cover_url ? <img src={product.cover_url} alt={`Couverture de ${product.title}`} /> : <Box />}
                <Badge tone="demo">{product.category ?? 'Produit'}</Badge>
              </div>
              <div className="product-info">
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <div className="product-meta">
                  <span>Produit numérique</span>
                  <span>
                    {product.promo_price_cents ? <del>{money(product.price_cents, product.currency)}</del> : null}
                    <strong className="price">{money(product.promo_price_cents ?? product.price_cents, product.currency)}</strong>
                  </span>
                </div>
                <Link href={`/product/${product.slug}`} className="button button-dark">Découvrir <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} /></Link>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="Les premiers produits arrivent." description="Cette boutique n’a pas encore publié de ressource." />}
    </div>
  );
}