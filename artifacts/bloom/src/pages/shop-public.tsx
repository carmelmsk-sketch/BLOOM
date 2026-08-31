import { useEffect, useState } from 'react';
import { ArrowLeft, Box, LoaderCircle, Store } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { Badge, Card, EmptyState } from '@/components/ui';
import { apiGet, type ApiError } from '@/services/api';

type Shop = { id: string; name: string; slug: string; description?: string };
type Product = { id: string; title: string; description?: string; slug: string; price_cents: number; category?: string };

export default function ShopPublicPage() {
  const [, params] = useRoute('/shop/:slug');
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => { if (!params?.slug) return; void apiGet<{ shop: Shop }>(`/shops/${params.slug}`).then((data) => { setShop(data.shop); return apiGet<{ products: Product[] }>(`/products?shop=${encodeURIComponent(data.shop.id)}`); }).then((data) => setProducts(data.products)).catch(() => setState('error')).finally(() => setState((current) => current === 'error' ? current : 'ready')); }, [params?.slug]);
  if (state === 'loading') return <div className="content-wrap"><div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On ouvre la boutique…</div></div>;
  if (state === 'error' || !shop) return <div className="content-wrap"><EmptyState title="Cette boutique n’est pas disponible" description="Elle est peut-être encore en préparation ou son adresse a changé." action={<Link href="/discover" className="button button-primary"><ArrowLeft size={15} /> Revenir à Découvrir</Link>} /></div>;
  return <div className="content-wrap public-shop"><Link href="/discover" className="button button-ghost"><ArrowLeft size={15} /> Découvrir</Link><div className="public-shop-head"><div className="shop-avatar"><Store size={27} /></div><p className="kicker">Boutique Bloom</p><h1>{shop.name}</h1><p>{shop.description || 'Une boutique en construction, portée par une idée.'}</p></div>{products.length ? <div className="product-grid">{products.map((product) => <Card key={product.id} className="product-card card-lift"><div className="product-cover cover-wine"><Badge tone="demo">{product.category ?? 'Produit'}</Badge><Box /></div><div className="product-info"><h3>{product.title}</h3><p>{product.description}</p><div className="product-meta"><span>Produit numérique</span><strong className="price">{new Intl.NumberFormat('fr-FR').format(product.price_cents / 100)} XOF</strong></div><Link href={`/product/${product.slug}`} className="button button-dark">Découvrir <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} /></Link></div></Card>)}</div> : <EmptyState title="Les premiers produits arrivent." description="Cette boutique n’a pas encore publié de ressource." />}</div>;
}