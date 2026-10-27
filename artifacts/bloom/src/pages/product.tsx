import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole, ShoppingBag } from 'lucide-react';
import { Link, useRoute, useLocation } from 'wouter';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { apiGet, apiPost, type ApiError } from '@/services/api';

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
  product_type?: string;
  shops?: { name?: string; slug?: string; status?: string };
};

type PaymentConfig = {
  configured: boolean;
  provider: 'kkiapay';
  public_key: string | null;
  sandbox: boolean;
};

type PaymentResponse = {
  order: { id: string };
  payment: {
    public_key: string;
    amount: number;
    currency: string;
    sandbox: boolean;
    partner_id: string;
  };
};

type KkiapaySuccess = { transactionId?: string; transaction_id?: string };

declare global {
  interface Window {
    openKkiapayWidget?: (options: Record<string, unknown>) => void;
    addSuccessListener?: (listener: (response: KkiapaySuccess) => void) => void;
    addFailedListener?: (listener: (error: unknown) => void) => void;
  }
}

function money(cents: number, currency: string) {
  return `${new Intl.NumberFormat('fr-FR').format(cents / 100)} ${currency}`;
}

function loadKkiapay() {
  if (window.openKkiapayWidget) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-kkiapay-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Le widget Kkiapay n’a pas pu être chargé.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.kkiapay.me/k.js';
    script.async = true;
    script.dataset.kkiapaySdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Le widget Kkiapay n’a pas pu être chargé.'));
    document.body.appendChild(script);
  });
}

export default function ProductPage() {
  const [, params] = useRoute('/product/:slug');
  const [, navigate] = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!params?.slug) return;
    void apiGet<{ product: Product }>(`/products/${params.slug}`)
      .then((data) => setProduct(data.product))
      .catch(() => setMessage('Ce produit n’est pas disponible.'))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  async function startCheckout() {
    if (!product) return;
    setCheckout('loading');
    setMessage('');
    try {
      const config = await apiGet<PaymentConfig>('/checkout/config');
      if (!config.configured || !config.public_key) {
        setCheckout('error');
        setMessage('Le paiement Kkiapay n’est pas encore configuré. Aucun paiement n’a été lancé.');
        return;
      }

      const started = await apiPost<PaymentResponse>('/checkout', {
        product_id: product.id,
        provider: 'kkiapay',
      });
      await loadKkiapay();

      window.addSuccessListener?.(async (response) => {
        const transactionId = response.transactionId ?? response.transaction_id;
        if (!transactionId) {
          setCheckout('error');
          setMessage('Kkiapay n’a pas renvoyé de référence de transaction.');
          return;
        }
        try {
          await apiPost(`/checkout/${started.order.id}/confirm`, { transaction_id: transactionId });
          setCheckout('idle');
          setMessage('Paiement confirmé. Ton accès sera disponible dans tes achats.');
        } catch (cause) {
          const error = cause as ApiError;
          setCheckout('error');
          setMessage(error.message);
        }
      });
      window.addFailedListener?.(() => {
        setCheckout('error');
        setMessage('Le paiement Kkiapay n’a pas été confirmé.');
      });

      if (!window.openKkiapayWidget) {
        throw new Error('Le widget Kkiapay est indisponible.');
      }
      window.openKkiapayWidget({
        amount: started.payment.amount,
        key: started.payment.public_key,
        sandbox: started.payment.sandbox,
        partnerId: started.payment.partner_id,
        position: 'center',
        theme: '#6b1f32',
        data: JSON.stringify({ orderId: started.order.id, productId: product.id }),
      });
    } catch (cause) {
      const error = cause as ApiError;
      if (error.status === 401) {
        navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      setCheckout('error');
      setMessage(error.message);
    }
  }

  if (loading) return <div className="content-wrap"><div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On prépare la page produit…</div></div>;
  if (!product) return <div className="content-wrap"><EmptyState title="Produit introuvable" description={message} action={<Link href="/discover" className="button button-primary">Retour à Découvrir</Link>} /></div>;

  const activePrice = product.promo_price_cents ?? product.price_cents;

  return (
    <div className="content-wrap product-detail">
      <Link href="/discover" className="button button-ghost"><ArrowLeft size={15} /> Découvrir</Link>
      <div className="product-detail-grid">
        <div className="product-detail-art">
          <span className="kicker">{product.shops?.name ?? 'Ressource Bloom'}</span>
          <h1>{product.title}</h1>
          {product.cover_url ? (
            <img className="product-detail-cover" src={product.cover_url} alt={`Couverture de ${product.title}`} />
          ) : (
            <div className="product-shape"><ShoppingBag size={52} /></div>
          )}
        </div>
        <Card className="product-detail-card">
          <Badge tone="burgundy">{product.category ?? 'Produit numérique'}</Badge>
          <h2>{product.title}</h2>
          <p>{product.description || 'Une ressource préparée pour t’aider à passer à l’action.'}</p>
          <div className="detail-meta">
            <span>Format {product.product_type ?? 'numérique'}</span>
            <span>
              {product.promo_price_cents ? <del>{money(product.price_cents, product.currency)}</del> : null}
              <strong>{money(activePrice, product.currency)}</strong>
            </span>
          </div>
          {product.shops?.slug && <Link href={`/shop/${product.shops.slug}`} className="shop-inline-link">Voir la boutique de {product.shops.name}</Link>}
          {message && <div className={`form-status ${checkout === 'error' ? 'error' : 'success'}`}>{message}</div>}
          <Button variant="primary" onClick={startCheckout} disabled={checkout === 'loading'}>
            {checkout === 'loading' ? <LoaderCircle className="spin" size={16} /> : <LockKeyhole size={16} />}
            {checkout === 'loading' ? 'Préparation du paiement…' : 'Payer avec Kkiapay'}
          </Button>
          <div className="safe-note"><CheckCircle2 size={15} /> La commande ne passe en “payée” qu’après vérification serveur Kkiapay.</div>
        </Card>
      </div>
    </div>
  );
}