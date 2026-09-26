import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, Check, LoaderCircle } from 'lucide-react'
import { Button, Card, Input, PageHeader, Toast } from '@/components/ui'
import { creationTypes, categories } from '@/services/demo-content'
import { apiGet, apiPost, type ApiError } from '@/services/api'
import { useBloomState } from '@/hooks/use-bloom-state'

type Shop = {
  id: string
  name: string
  slug: string
  status?: string
}

const productTypeMap: Record<string, string> = {
  ebook: 'ebook',
  formation: 'formation',
  pack: 'pack',
  template: 'template',
  guide: 'guide',
  autre: 'other',
}

const countries = [
  { code: 'BJ', name: 'Bénin', currency: 'XOF', symbol: 'F CFA' },
  { code: 'CI', name: 'Côte d’Ivoire', currency: 'XOF', symbol: 'F CFA' },
  { code: 'SN', name: 'Sénégal', currency: 'XOF', symbol: 'F CFA' },
  { code: 'TG', name: 'Togo', currency: 'XOF', symbol: 'F CFA' },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF', symbol: 'F CFA' },
  { code: 'ML', name: 'Mali', currency: 'XOF', symbol: 'F CFA' },
  { code: 'NE', name: 'Niger', currency: 'XOF', symbol: 'F CFA' },
  { code: 'CM', name: 'Cameroun', currency: 'XAF', symbol: 'FCFA' },
  { code: 'CD', name: 'RDC', currency: 'CDF', symbol: 'FC' },
  { code: 'US', name: 'États-Unis', currency: 'USD', symbol: '$' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP', symbol: '£' },
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR', symbol: '€' },
  { code: 'BE', name: 'Belgique', currency: 'EUR', symbol: '€' },
  { code: 'CH', name: 'Suisse', currency: 'CHF', symbol: 'CHF' },
  { code: 'MA', name: 'Maroc', currency: 'MAD', symbol: 'DH' },
  { code: 'DZ', name: 'Algérie', currency: 'DZD', symbol: 'DA' },
  { code: 'TN', name: 'Tunisie', currency: 'TND', symbol: 'DT' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', symbol: 'GH₵' },
  { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
  { code: 'ZA', name: 'Afrique du Sud', currency: 'ZAR', symbol: 'R' },
]

const currencies = [
  { code: 'XOF', label: 'Franc CFA (UEMOA)', symbol: 'F CFA' },
  { code: 'XAF', label: 'Franc CFA (CEMAC)', symbol: 'FCFA' },
  { code: 'CDF', label: 'Franc congolais', symbol: 'FC' },
  { code: 'USD', label: 'Dollar américain', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'Livre sterling', symbol: '£' },
  { code: 'CAD', label: 'Dollar canadien', symbol: '$' },
  { code: 'AUD', label: 'Dollar australien', symbol: '$' },
  { code: 'CHF', label: 'Franc suisse', symbol: 'CHF' },
  { code: 'MAD', label: 'Dirham marocain', symbol: 'DH' },
  { code: 'DZD', label: 'Dinar algérien', symbol: 'DA' },
  { code: 'TND', label: 'Dinar tunisien', symbol: 'DT' },
  { code: 'NGN', label: 'Naira nigérian', symbol: '₦' },
  { code: 'GHS', label: 'Cedi ghanéen', symbol: 'GH₵' },
  { code: 'KES', label: 'Shilling kényan', symbol: 'KSh' },
  { code: 'ZAR', label: 'Rand sud-africain', symbol: 'R' },
]

export default function CreatePage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [loadingShops, setLoadingShops] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Création de contenu',
    price: '',
    promoPrice: '',
    country: 'BJ',
    currency: 'XOF',
    coverUrl: '',
    shopId: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [minimums, setMinimums] = useState<Record<string, number>>({})
  const { notify, toast } = useBloomState()

  useEffect(() => {
    void apiGet<{ minimums: { currency: string; min_price_cents: number }[] }>('/currency-minimums')
      .then((data) => {
        const map: Record<string, number> = {}
        data.minimums.forEach((item) => { map[item.currency] = item.min_price_cents / 100 })
        setMinimums(map)
      })
      .catch(() => setMinimums({}))
  }, [])

  useEffect(() => {
    void apiGet<{ shops: Shop[] }>('/shops/mine')
      .then((data) => setShops(data.shops))
      .catch(() => setShops([]))
      .finally(() => setLoadingShops(false))
  }, [])

  function updateCountry(countryCode: string) {
    const country = countries.find((item) => item.code === countryCode)

    setForm((current) => ({
      ...current,
      country: countryCode,
      currency: country?.currency ?? current.currency,
    }))
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!selected) {
      setError('Choisis d’abord un format de produit.')
      return
    }

    if (!form.title.trim()) {
      setError('Le titre du produit est requis.')
      return
    }

    if (form.description.trim().length < 20) {
      setError('La description doit contenir au moins 20 caractères.')
      return
    }

    const price = Number(form.price)
    const promoPrice = form.promoPrice.trim()
      ? Number(form.promoPrice)
      : null
    const minPrice = minimums[form.currency] ?? 1
    const currencyLabel = currencies.find((currency) => currency.code === form.currency)?.symbol ?? form.currency

    if (!Number.isFinite(price) || price < minPrice) {
      setError(`Le prix normal doit être d’au moins ${minPrice} ${currencyLabel}.`)
      return
    }

    if (
      promoPrice !== null &&
      (!Number.isFinite(promoPrice) || promoPrice < minPrice || promoPrice >= price)
    ) {
      setError(`Le prix promotionnel doit être d’au moins ${minPrice} ${currencyLabel} et inférieur au prix normal.`)
      return
    }

    setSaving(true)

    try {
      const result = await apiPost<{ product: { id: string; slug: string } }>('/products', {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        product_type: productTypeMap[selected] ?? 'other',
        price_cents: Math.round(price * 100),
        promo_price_cents: promoPrice === null ? null : Math.round(promoPrice * 100),
        currency: form.currency,
        cover_url: form.coverUrl.trim() || null,
        shop_id: form.shopId || null,
      })

      notify('Produit créé en brouillon.')
      window.location.href = `/product/${result.product.slug}`
    } catch (cause) {
      const apiError = cause as ApiError
      setError(apiError.message)
    } finally {
      setSaving(false)
    }
  }

  const currencyInfo =
    currencies.find((currency) => currency.code === form.currency)

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="Créer"
        title="Qu'est-ce que tu veux créer ?"
        description="Présente ton produit clairement. Il sera enregistré en brouillon avant sa publication."
        action={
          <a href="/dashboard" className="button button-ghost">
            Mon dashboard <ArrowRight size={15} />
          </a>
        }
      />

      <div className="creation-grid">
        {creationTypes.map((type) => {
          const Icon = type.icon

          return (
            <div
              key={type.id}
              className={`card-lift ${selected === type.id ? 'selected' : ''}`}
              onClick={() => setSelected(type.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelected(type.id)
                }
              }}
            >
              <div className="creation-icon">
                <Icon size={16} />
              </div>

              <div className="creation-copy">
                <h3>{type.title}</h3>
                <p>{type.description}</p>
              </div>

              <div
                className="check"
                style={{
                  right: 18,
                  position: 'absolute',
                  bottom: 18,
                  color: '#6b5a2a',
                }}
              >
                {selected === type.id && <Check />}
              </div>
            </div>
          )
        })}
      </div>

      <section className="product-editor fade-up">
        <div className="section-title">
          <h2>Donne une première forme à ton produit.</h2>
          <div>
            <span className="badge">Brouillon</span>
          </div>
        </div>

        {error && <div className="form-status error">{error}</div>}

        <form className="form" onSubmit={submit}>
          <div className="form-grid">
            <label className="full">
              <span>Titre</span>
              <Input
                className="input"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Ex : Le guide pour lancer son premier produit digital"
                maxLength={150}
              />
            </label>

            <label className="full">
              <span>Description détaillée</span>
              <textarea
                className="input"
                rows={7}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Explique le problème que ton produit résout, ce qu'il contient, pour qui il est destiné et le résultat recherché."
                maxLength={10000}
              />
              <small>{form.description.length}/10000</small>
            </label>

            <label>
              <span>Catégorie</span>
              <select
                className="input"
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Boutique</span>
              <select
                className="input"
                value={form.shopId}
                onChange={(event) => updateField('shopId', event.target.value)}
                disabled={loadingShops}
              >
                <option value="">
                  {loadingShops ? 'Chargement...' : 'Aucune boutique'}
                </option>

                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Pays</span>
              <select
                className="input"
                value={form.country}
                onChange={(event) => updateCountry(event.target.value)}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Devise</span>
              <select
                className="input"
                value={form.currency}
                onChange={(event) => updateField('currency', event.target.value)}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} — {currency.label}
                  </option>
                ))}
              </select>
              <small>
                Devise proposée : {currencyInfo?.symbol ?? form.currency}
              </small>
            </label>

            <label>
              <span>Prix normal ({currencyInfo?.symbol ?? form.currency})</span>
              <Input
                type="number"
                min={minimums[form.currency] ?? 1}
                step="1"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                placeholder="Ex : 4000"
              />
              <small>Minimum : {minimums[form.currency] ?? 1} {currencyInfo?.symbol ?? form.currency}</small>
            </label>

            <label>
              <span>Prix promotionnel — optionnel</span>
              <Input
                type="number"
                min={minimums[form.currency] ?? 1}
                step="1"
                value={form.promoPrice}
                onChange={(event) => updateField('promoPrice', event.target.value)}
                placeholder="Ex : 3000"
              />
            </label>

            <label className="full">
              <span>URL de la couverture — optionnel pour le brouillon</span>
              <Input
                className="input"
                type="url"
                value={form.coverUrl}
                onChange={(event) => updateField('coverUrl', event.target.value)}
                placeholder="https://..."
              />
            </label>

          </div>

          <Button variant="primary" disabled={saving} type="submit">
            {saving ? (
              <>
                <LoaderCircle className="spin" /> Enregistrement...
              </>
            ) : (
              <>
                <ArrowRight size={16} /> Enregistrer le brouillon
              </>
            )}
          </Button>

          <p className="hint">
            Le brouillon peut être complété avant publication.
          </p>
        </form>
      </section>

      <Card className="card fade-up">
        <div className="section-title">
          <h3>Bloom Coach peut t'aider</h3>
          <span className="badge" style={{ color: '#6b5d2a' }}>
            <strong>Passe en mode coach pour structurer ton idée</strong>
          </span>
        </div>

        <a href="/coach" className="button button-outline">
          Demander à Bloom
        </a>
      </Card>

      {toast && <Toast message={toast} />}
    </div>
  )
}
