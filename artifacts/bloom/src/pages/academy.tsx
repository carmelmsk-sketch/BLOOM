import { ArrowRight, BookOpen, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Card, PageHeader } from '@/components/ui';

export default function AcademyPage() {
  return <div className="content-wrap"><PageHeader eyebrow="Apprendre" title="Bloom Academy" description="Des repères utiles pour mieux comprendre, puis passer à l’action." action={<span className="badge badge-demo">Bientôt disponible</span>} /><div className="home-grid" style={{ marginTop: 0 }}><Card className="home-callout"><BookOpen color="#285c68" /><h3>Apprendre sans s’éparpiller.</h3><p>Une bibliothèque de parcours courts, de ressources et d’exercices pour nourrir ton prochain projet.</p><Link href="/discover" className="button button-dark" data-testid="link-academy-discover">Explorer les démos <ArrowRight size={15} /></Link></Card><Card className="home-mini"><div><PlayCircle color="#6e2134" /><h3>Les premiers parcours arrivent bientôt.</h3></div><Sparkles color="#8b6d26" /></Card></div></div>;
}