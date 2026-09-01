import { ArrowRight, CheckCircle2, Clock3, Sprout } from 'lucide-react';
import { Link } from 'wouter';
import { Card, EmptyState, PageHeader } from '@/components/ui';

export default function ActivityPage() {
  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="Ton chemin"
        title="Activité"
        description="Les petits pas deviennent visibles quand on les regarde ensemble."
      />
      <div className="card" style={{ padding: 40, marginBottom: 24, textAlign: 'center' }}>
        <Sprout size={48} style={{ color: '#a89860', margin: '0 auto 20px', opacity: 0.7 }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px' }}>Tu commences tout juste</h2>
        <p style={{ fontSize: 14, color: '#695e55', margin: '0 0 24px', maxWidth: 400 }}>
          Tes actions, tes créations et tes apprentissages apparaîtront ici. C'est une vue personnelle de ta progression.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/academy" className="button button-outline" style={{ display: 'inline-flex', gap: 6 }}>
            Découvrir l'Academy <ArrowRight size={14} />
          </Link>
          <Link href="/create" className="button button-primary" style={{ display: 'inline-flex', gap: 6 }}>
            Créer mon produit <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Types d'activités que tu verras ici</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {[
            { icon: CheckCircle2, label: 'Créations', desc: 'Tes produits lancés' },
            { icon: Clock3, label: 'Apprentissages', desc: 'Les cours suivis' },
            { icon: ArrowRight, label: 'Actions', desc: 'Les étapes franchies' },
            { icon: Sprout, label: 'Croissance', desc: 'Ta progression' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} style={{ padding: 16, textAlign: 'center' }}>
                <Icon size={24} style={{ margin: '0 auto 8px', color: '#a89860' }} />
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{item.label}</h4>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
