import { useEffect, useState } from 'react';
import { Bell, Check, LoaderCircle } from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui';
import { apiGet, type ApiError } from '@/services/api';

type Notification = { id: string; title: string; body?: string; read_at?: string | null; created_at?: string };
export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { void apiGet<{ notifications: Notification[] }>('/notifications').then((data) => setItems(data.notifications)).catch((cause: ApiError) => setError(cause.message)).finally(() => setLoading(false)); }, []);
  return <div className="content-wrap"><PageHeader eyebrow="Ton espace" title="Notifications" description="Les messages importants, au bon endroit." />{loading ? <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On cherche tes notifications…</div> : error ? <EmptyState title="Impossible de charger tes notifications" description={error} /> : items.length ? <div className="notification-list">{items.map((item) => <Card className={`notification-row ${item.read_at ? '' : 'unread'}`} key={item.id}><div className="notification-icon"><Bell size={16} /></div><div><Badge tone={item.read_at ? 'blue' : 'demo'}>{item.read_at ? 'Lu' : 'Nouveau'}</Badge><h3>{item.title}</h3><p>{item.body}</p></div>{item.read_at && <Check size={16} />}</Card>)}</div> : <EmptyState title="Rien de nouveau pour le moment" description="Quand quelque chose méritera ton attention, tu le retrouveras ici." />}</div>;
}