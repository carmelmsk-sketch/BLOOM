import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/currency';

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  promo_price_cents: number | null;
  currency: string;
  cover_url: string | null;
  product_type: string;
  category: string;
  status: 'draft' | 'published';
  shop_id: string;
  created_at: string;
  shops?: {
    name: string;
    slug: string;
  };
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          throw new Error('Produit introuvable');
        }
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Produit non trouvé'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const shop = Array.isArray(product.shops) ? product.shops[0] : product.shops;
  const displayPrice = formatCurrency(product.price_cents, product.currency);
  const displayPromoPrice = product.promo_price_cents
    ? formatCurrency(product.promo_price_cents, product.currency)
    : null;
  const discount = product.promo_price_cents
    ? Math.round(
        ((product.price_cents - product.promo_price_cents) / product.price_cents) * 100
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Cover image */}
          <div className="flex items-start">
            {product.cover_url ? (
              <img
                src={product.cover_url}
                alt={product.title}
                className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center text-gray-400">
                Pas de couverture
              </div>
            )}
          </div>

          {/* Right: Product details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.title}</h1>
            </div>

            {/* Shop info */}
            {shop && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <button
                  onClick={() => navigate(`/shop/${shop.slug}`)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {shop.name}
                </button>
              </div>
            )}

            {/* Status badge */}
            {product.status === 'draft' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">⚠️ Ce produit n'est pas encore publié</p>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                {displayPromoPrice ? (
                  <>
                    <span className="text-4xl font-bold text-green-600">{displayPromoPrice}</span>
                    <span className="text-2xl text-gray-400 line-through">{displayPrice}</span>
                    {discount && (
                      <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded">
                        -{discount}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">{displayPrice}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">À propos</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
            </div>

            {/* Product type */}
            <div className="mb-8">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Type:</span> {product.product_type}
              </p>
            </div>

            {/* Purchase button */}
            {product.status === 'published' ? (
              <button
                onClick={() => navigate(`/checkout/${product.slug}`)}
                className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                Acheter maintenant
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 px-4 bg-gray-300 text-gray-600 font-bold rounded-lg cursor-not-allowed"
              >
                Non disponible
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
