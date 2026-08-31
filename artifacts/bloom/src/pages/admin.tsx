import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, LoaderCircle, ShieldCheck, Users } from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui';
import { apiGet, type ApiError } from '@/services/api';

type Overview = { users: number; products: number; shops: number; orders: number; payments: number };
export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  useEffect(() => { void apiGet<{ overview: Overview }>('/admin/overview').then((result) => setData(result.overview)).catch((cause: ApiError) => { setError(cause.message); setState('error'); }).finally(() => setState((current) => current === 'error' ? current : 'ready')); }, []);
  return <div className="content-wrap"><PageHeader eyebrow="Espace sécurisé" title={<>Garder Bloom <em>vivant.</em></>} description="Les outils d’administration restent séparés des espaces utilisateurs et ne montrent que les données autorisées." action={<Badge tone="burgundy"><ShieldCheck size={13} /> Admin</Badge>} />{state === 'loading' ? <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> Vérification des droits…</div> : state === 'error' ? <EmptyState title="Accès non disponible" description={error || 'Cet espace est réservé aux administrateurs.'} action={<div className="admin-warning"><AlertTriangle size={16} /> Aucun contenu sensible n’est affiché sans autorisation.</div>} /> : data && <><div className="metric-grid"><AdminMetric label="Utilisateurs" value={data.users} icon={Users} /><AdminMetric label="Produits" value={data.products} icon={BarChart3} /><AdminMetric label="Boutiques" value={data.shops} icon={ShieldCheck} /></div><Card className="admin-table"><p className="kicker">Vue d’ensemble</p><h2>Les objets BLOOM</h2><div className="dashboard-list"><div><span>Commandes</span><strong>{data.orders}</strong></div><div><span>Paiements enregistrés</span><strong>{data.payments}</strong></div></div></Card></>}</div>;
}
function AdminMetric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) { return <Card className="metric-card metric-wine"><div className="metric-icon"><Icon size={18} /></div><p>{label}</p><strong>{value}</strong></Card>; }