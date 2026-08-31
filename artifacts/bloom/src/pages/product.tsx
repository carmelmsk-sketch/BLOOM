import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole, ShoppingBag } from 'lucide-react';
import { Link, useRoute, useLocation } from 'wouter';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { apiGet, apiPost, type ApiError } from '@/services/api';

type Product = { id: string; title: string; description?: string; slug: string; price_cents: number; category?: string; product_type?: string; shops?: { name?: string; slug?: string } };

export default function ProductPage() {
  const [, params] = useRoute('/product/:slug');
  const [, navigate] = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  useEffect(() => { if (!params?.slug) return; void apiGet<{ product: Product }>(`/products/${params.slug}`).then((data) => setProduct(data.product)).catch(() => setMessage('Ce produit n’est pas disponible.')).finally(() => setLoading(false)); }, [params?.slug]);
  async function startCheckout() { setCheckout('loading'); setMessage(''); try { await apiPost('/checkout', { product_id: product?.id, provider: 'mobile_money' }); } catch (cause) { const error = cause as ApiError; if (error.status === 401) { navigate(`/auth?next=${encodeURIComponent(window.location.pathname)}`); return; } setCheckout('error'); setMessage(error.message); } }
  if (loading) return <div className="content-wrap"><div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On prépare la page produit…</div></div>;
  if (!product) return <div className="content-wrap"><EmptyState title="Produit introuvable" description={message} action={<Link href="/discover" className="button button-primary">Retour à Découvrir</Link>} /></div>;
  return <div className="content-wrap product-detail"><Link href="/discover" className="button button-ghost"><ArrowLeft size={15} /> Découvrir</Link><div className="product-detail-grid"><div className="product-detail-art"><span className="kicker">Ressource Bloom</span><h1>{product.title}</h1><div className="product-shape"><ShoppingBag size={52} /></div></div><Card className="product-detail-card"><Badge tone="burgundy">{product.category ?? 'Produit numérique'}</Badge><h2>{product.title}</h2><p>{product.description || 'Une ressource préparée pour t’aider à passer à l’action.'}</p><div className="detail-meta"><span>Format {product.product_type ?? 'numérique'}</span><strong>{new Intl.NumberFormat('fr-FR').format(product.price_cents / 100)} XOF</strong></div>{message && <div className={`form-status ${checkout === 'error' ? 'error' : 'success'}`}>{message}</div>}<Button variant="primary" onClick={startCheckout} disabled={checkout === 'loading'}>{checkout === 'loading' ? <LoaderCircle className="spin" size={16} /> : <LockKeyhole size={16} />} {checkout === 'loading' ? 'Vérification…' : 'Continuer vers le checkout'}</Button><div className="safe-note"><CheckCircle2 size={15} /> Le paiement ne sera jamais confirmé sans fournisseur connecté.</div></Card></div></div>;
}