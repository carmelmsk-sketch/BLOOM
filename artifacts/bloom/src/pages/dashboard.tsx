import { useEffect, useState } from 'react';
import { ArrowUpRight, Box, CircleDollarSign, Clock3, LoaderCircle, Store, WalletCards } from 'lucide-react';
import { Link } from 'wouter';
import { Badge, Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { apiGet, type ApiError } from '@/services/api';

type Summary = { revenue_cents: number; sales_count: number; orders_count: number; products_count: number; shops_count: number; wallet_status: string };
const money = (cents: number) => `${new Intl.NumberFormat('fr-FR').format(cents / 100)} XOF`;

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { void apiGet<{ summary: Summary }>('/dashboard/summary').then((data) => setSummary(data.summary)).catch((cause: ApiError) => setError(cause.message)).finally(() => setLoading(false)); }, []);
  return <div className="content-wrap"><PageHeader eyebrow="Espace vendeur" title={<>Bonjour, on avance sur <em>quoi ?</em></>} description="Retrouve ici les signaux réels de ton activité, sans pression ni chiffres inventés." action={<Link href="/shop" className="button button-primary"><Store size={15} /> Ma boutique</Link>} />{loading ? <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On prépare ton tableau de bord…</div> : error ? <EmptyState title="Les données ne sont pas disponibles" description={error} action={<Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>} /> : summary && <><div className="metric-grid"><Metric label="Revenus encaissés" value={money(summary.revenue_cents)} icon={CircleDollarSign} tone="gold" /><Metric label="Ventes confirmées" value={String(summary.sales_count)} icon={ArrowUpRight} tone="wine" /><Metric label="Commandes" value={String(summary.orders_count)} icon={Box} tone="blue" /><Metric label="Produits" value={String(summary.products_count)} icon={WalletCards} tone="green" /></div><div className="dashboard-grid"><Card className="dashboard-panel"><div className="section-title"><div><p className="kicker">Ce qui est connecté</p><h2>Ton activité réelle</h2></div><Badge tone="green">Synchronisé</Badge></div><div className="dashboard-list"><div><span>Revenus</span><strong>{money(summary.revenue_cents)}</strong></div><div><span>Ventes</span><strong>{summary.sales_count}</strong></div><div><span>Boutiques</span><strong>{summary.shops_count}</strong></div></div></Card><Card className="dashboard-panel dashboard-wallet"><WalletCards size={22} /><p className="kicker">Wallet</p><h2>Prêt pour la suite.</h2><p>Le solde sera disponible quand un fournisseur de paiement sera connecté. Bloom ne simule aucun mouvement d’argent.</p><Badge tone="demo">Fournisseur à connecter</Badge></Card></div><div className="dashboard-next"><Clock3 size={17} /><div><strong>Ton prochain projet commence ici.</strong><span>Prépare ton premier produit ou complète ta boutique.</span></div><Link href="/create" className="button button-dark">Créer un produit</Link></div></>}</div>;
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof CircleDollarSign; tone: string }) {
  return <Card className={`metric-card metric-${tone}`}><div className="metric-icon"><Icon size={18} /></div><p>{label}</p><strong>{value}</strong></Card>;
}