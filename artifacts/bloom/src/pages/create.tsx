import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadCover } from '../lib/supabase-storage';
import { formatCurrency, parseCurrency } from '../lib/currency';

interface CreateProductForm {
  title: string;
  description: string;
  product_type: string;
  category: string;
  price_cents: number;
  promo_price_cents: number | null;
  currency: string;
  cover_file: File | null;
  file_path: string | null;
  shop_id: string;
}

export function CreateProductPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CreateProductForm>({
    title: '',
    description: '',
    product_type: '',
    category: 'Création de contenu',
    price_cents: 55000,
    promo_price_cents: null,
    currency: 'XOF',
    cover_file: null,
    file_path: null,
    shop_id: '',
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shops, setShops] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch creator's shops on mount
  useState(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch('/api/shops/mine');
        if (res.ok) {
          const data = await res.json();
          setShops(data.shops || []);
          if (data.shops?.length > 0) {
            setForm((f) => ({ ...f, shop_id: data.shops[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load shops:', err);
      }
    };
    fetchShops();
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image doit faire moins de 5MB');
      return;
    }

    setForm((f) => ({ ...f, cover_file: file }));
    setCoverPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!form.title || !form.description || !form.product_type || !form.shop_id) {
        throw new Error('Complète tous les champs obligatoires');
      }

      // Upload cover if provided
      let coverUrl: string | null = null;
      if (form.cover_file) {
        try {
          const { url } = await uploadCover(form.cover_file, 'current_user_id', 'temp');
          coverUrl = url;
        } catch (err) {
          throw new Error('Erreur lors de l\'upload de la couverture');
        }
      }

      // Create product
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          product_type: form.product_type,
          category: form.category,
          price_cents: form.price_cents,
          promo_price_cents: form.promo_price_cents,
          currency: form.currency,
          cover_url: coverUrl,
          file_path: form.file_path,
          shop_id: form.shop_id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur de création');
      }

      const data = await res.json();
      navigate(`/product/${data.product.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Créer un produit</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Boutique *
          </label>
          <select
            value={form.shop_id}
            onChange={(e) => setForm({ ...form, shop_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Sélectionne une boutique</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            minLength={3}
            maxLength={150}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            minLength={20}
            maxLength={10000}
            rows={6}
          />
        </div>

        {/* Product type and category */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de produit *
            </label>
            <select
              value={form.product_type}
              onChange={(e) => setForm({ ...form, product_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Sélectionne un type</option>
              <option value="ebook">E-book</option>
              <option value="formation">Formation</option>
              <option value="pack">Pack</option>
              <option value="template">Template</option>
              <option value="guide">Guide</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Currency and pricing */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devise
            </label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="XOF">XOF (Franc CFA)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix normal *
            </label>
            <input
              type="number"
              value={form.price_cents / 100}
              onChange={(e) =>
                setForm({ ...form, price_cents: parseCurrency(e.target.value, form.currency) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min={5.5}
              step={0.01}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix promo (optionnel)
            </label>
            <input
              type="number"
              value={form.promo_price_cents ? form.promo_price_cents / 100 : ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  promo_price_cents: e.target.value
                    ? parseCurrency(e.target.value, form.currency)
                    : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min={5.5}
              step={0.01}
            />
          </div>
        </div>

        {/* Cover image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couverture (image)
          </label>
          <div className="flex gap-4">
            {coverPreview && (
              <div className="w-24 h-32 rounded-lg overflow-hidden bg-gray-100">
                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition text-gray-700"
              >
                {coverPreview ? 'Changer l\'image' : 'Ajouter une couverture'}
              </button>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Création en cours...' : 'Créer le produit'}
          </button>
        </div>
      </form>
    </div>
  );
}
