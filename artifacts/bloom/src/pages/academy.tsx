import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, LoaderCircle, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui';
import { apiGet, type ApiError } from '@/services/api';

type Course = { id: string; title: string; description?: string; status?: string; lessons?: { id: string; title: string; position?: number }[] };
export default function AcademyPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  useEffect(() => { void apiGet<{ courses: Course[] }>('/academy/courses').then((data) => { setCourses(data.courses); setState('ready'); }).catch((cause: ApiError) => { setError(cause.message); setState('error'); }); }, []);
  return <div className="content-wrap"><PageHeader eyebrow="Apprendre" title={<>Bloom <em>Academy.</em></>} description="Des parcours courts pour comprendre, créer et passer à l’action. La progression sera enregistrée à chaque leçon." action={<Badge tone="blue">Parcours réels</Badge>} />{state === 'loading' ? <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> On ouvre les parcours…</div> : state === 'error' ? <EmptyState title="Les parcours se préparent" description={error} /> : courses.length ? <div className="course-grid">{courses.map((course) => <Card className="course-card card-lift" key={course.id}><div className="course-icon"><BookOpen size={23} /></div><Badge tone="green">{course.lessons?.length ?? 0} leçon{course.lessons?.length === 1 ? '' : 's'}</Badge><h2>{course.title}</h2><p>{course.description || 'Un parcours pour avancer sans s’éparpiller.'}</p><button className="button button-dark">Commencer <ArrowRight size={14} /></button></Card>)}</div> : <div className="home-grid" style={{ marginTop: 0 }}><Card className="home-callout"><BookOpen color="#285c68" /><h3>Apprendre sans s’éparpiller.</h3><p>Les premiers parcours apparaîtront ici dès qu’ils seront publiés depuis l’espace admin.</p><Link href="/discover" className="button button-dark">Explorer Bloom <ArrowRight size={15} /></Link></Card><Card className="home-mini"><div><PlayCircle color="#6e2134" /><h3>Une leçon à la fois.</h3></div><Sparkles color="#8b6d26" /></Card></div>}</div>;
}