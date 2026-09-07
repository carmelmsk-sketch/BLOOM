import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, LoaderCircle, Sprout } from 'lucide-react';
import { Link } from 'wouter';
import { Card, EmptyState, PageHeader } from '@/components/ui';
import { apiGet, type ApiError } from '@/services/api';

type Event = { id: string; label: string; event_type?: string; created_at?: string };
export default function ActivityPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { void apiGet<{ activity: Event[] }>('/activity').then((data) => setEvents(data.activity)).catch((cause: ApiError) => setError(cause.message)).finally(() => setLoading(false)); }, []);
  return <div className="content-wrap"><PageHeader eyebrow="Ton chemin" title="Activité" description="Les petits pas deviennent visibles quand on les regarde ensemble." />{loading ? <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On rassemble tes avancées…</div> : error ? <EmptyState title="Ton journal n’est pas disponible" description={error} /> : <><Card className="activity-timeline"><div className="section-title"><div><div className="kicker">Données réelles</div><h2>Ton fil d’avancée</h2><p>Les événements apparaîtront après tes premières actions.</p></div><Sprout color="#8b6d26" /></div>{events.length ? events.map((event) => <div className="activity-row" key={event.id}><span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle2 color="#37633a" size={17} />{event.label}</span><strong>{event.created_at ? new Date(event.created_at).toLocaleDateString('fr-FR') : '—'}</strong></div>) : <EmptyState title="Pas encore de journal" description="Quand tu commenceras à créer, tes étapes trouveront leur place ici." action={<Link href="/create" className="button button-primary">Faire un pas <ArrowRight size={15} /></Link>} />}</Card><div className="activity-note"><Clock3 size={17} /><p>Bloom suit seulement les actions qui ont vraiment eu lieu. Pas de progression inventée.</p></div></>}</div>;
}