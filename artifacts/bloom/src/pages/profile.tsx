import { useEffect, useState } from 'react';
import { formatCurrency } from '../lib/currency';

interface DashboardSummary {
  revenue_cents: number;
  sales_count: number;
  orders_count: number;
  products_count: number;
  shops_count: number;
  wallet_status: string;
}

interface Product {
  id: string;
  title: string;
  status: 'draft' | 'published';
}

export function ProfilePage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sales'>('overview');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, productsRes] = await Promise.all([
          fetch('/api/dashboard/summary'),
          fetch('/api/products?mine=true'),
        ]);

        if (!summaryRes.ok || !productsRes.ok) {
          throw new Error('Failed to load dashboard');
        }

        const summaryData = await summaryRes.json();
        const productsData = await productsRes.json();

        setSummary(summaryData.summary);
        setProducts(productsData.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      </div>
    );
  }

  if (!summary) {
    return <div className="max-w-6xl mx-auto px-4 py-8">Aucune données disponibles</div>;
  }

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Revenus totaux</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.revenue_cents, 'XOF')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Ventes</p>
            <p className="text-2xl font-bold text-gray-900">{summary.sales_count}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Produits publiés</p>
            <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            <p className="text-xs text-gray-500 mt-2">{draftCount} en brouillon</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Boutiques</p>
            <p className="text-2xl font-bold text-gray-900">{summary.shops_count}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aperçu
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'products'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Produits
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'sales'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ventes
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Résumé</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Commandes totales</p>
                    <p className="text-xl font-bold text-gray-900">{summary.orders_count}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Statut portefeuille</p>
                    <p className="text-lg font-semibold text-yellow-600">
                      {summary.wallet_status === 'not_configured' ? 'Non configuré' : 'Activé'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Mes produits</h3>
                {products.length === 0 ? (
                  <p className="text-gray-600">Aucun produit pour le moment</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 border border-gray-200 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-xs text-gray-600">{product.id}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {product.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sales' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Activité des ventes</h3>
                <p className="text-gray-600">Aucune vente pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
