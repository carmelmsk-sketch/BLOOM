import { ArrowRight, BookOpen, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Card, PageHeader } from '@/components/ui';

const courses = [
  {
    id: 'fondations',
    title: `Les fondations d'un créateur`,
    description: 'Comprendre les bases avant de créer',
    level: 'Débutant',
    duration: '2h30',
    lessons: 5,
    icon: Sparkles,
  },
  {
    id: 'strategie',
    title: 'Stratégie de vente en ligne',
    description: 'Positionner et vendre ton premier produit',
    level: 'Intermédiaire',
    duration: '4h',
    lessons: 8,
    icon: PlayCircle,
  },
  {
    id: 'contenu',
    title: 'Créer du contenu qui vend',
    description: 'Écrire, filmer, transmettre ton expertise',
    level: 'Intermédiaire',
    duration: '3h30',
    lessons: 7,
    icon: BookOpen,
  },
  {
    id: 'croissance',
    title: 'De la première vente à la croissance',
    description: `Passer à l'échelle sans perdre l'âme`,
    level: 'Avancé',
    duration: '5h',
    lessons: 10,
    icon: Sparkles,
  },
];

const resources = [
  {
    type: 'Guide',
    title: 'Le guide complet du pricing',
    description: 'Comment fixer le bon prix pour ton produit',
  },
  {
    type: 'Template',
    title: 'Plan de lancement',
    description: 'Checklist pour ne rien oublier',
  },
  {
    type: 'Article',
    title: `Psychologie de l'acheteur digital`,
    description: 'Comprendre qui achète et pourquoi',
  },
  {
    type: 'Checklist',
    title: 'Avant de lancer ton produit',
    description: 'Les 50 points à vérifier',
  },
];

export default function AcademyPage() {
  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="Apprendre"
        title="Bloom Academy"
        description="Des repères utiles pour mieux comprendre, puis passer à l'action."
      />

      <section style={{ marginBottom: 60 }}>
        <div className="section-title fade-up" style={{ marginBottom: 24 }}>
          <div>
            <div className="kicker">Parcours structurés</div>
            <h2>Apprendre à ton rythme</h2>
          </div>
        </div>
        <div
          className="fade-up delay-1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <Card key={course.id} className="card-lift" style={{ padding: 24, cursor: 'pointer', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div className="kicker" style={{ fontSize: 11 }}>{course.level}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: '6px 0 0' }}>{course.title}</h3>
                  </div>
                  <Icon size={24} style={{ color: '#a89860', flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 14, color: '#695e55', margin: '0 0 16px' }}>{course.description}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
                  <span>📚 {course.lessons} leçons</span>
                  <span>⏱️ {course.duration}</span>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: 8,
                    background: '#a89860',
                    color: '#f4f0e8',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#9b8b5c';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#a89860';
                  }}
                  data-testid={`button-course-${course.id}`}
                >
                  Commencer <ArrowRight size={14} />
                </button>
              </Card>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: 60 }}>
        <div className="section-title fade-up" style={{ marginBottom: 24 }}>
          <div>
            <div className="kicker">Ressources rapides</div>
            <h2>Consulter quand tu en as besoin</h2>
          </div>
        </div>
        <div
          className="fade-up delay-1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          {resources.map((resource, index) => (
            <Card
              key={index}
              className="card-lift"
              style={{
                padding: 20,
                cursor: 'pointer',
                borderTop: '3px solid #a89860',
              }}
              data-testid={`resource-${index}`}
            >
              <div className="kicker" style={{ fontSize: 10 }}>{resource.type}</div>
              <h4 style={{ fontSize: 15, fontWeight: 600, margin: '6px 0 8px' }}>{resource.title}</h4>
              <p style={{ fontSize: 13, color: '#695e55', margin: 0 }}>{resource.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <Card className="fade-up" style={{ padding: 32, background: 'linear-gradient(135deg, #f4f0e8 0%, #faf8f3 100%)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px' }}>Besoin d'aide personnalisée?</h2>
          <p style={{ fontSize: 14, color: '#695e55', margin: '0 0 20px' }}>Parle avec Bloom Coach pour des réponses adaptées à ton projet.</p>
          <Link href="/coach" className="button button-primary" style={{ display: 'inline-flex', gap: 8 }}>
            Accéder au Coach <ArrowRight size={16} />
          </Link>
        </Card>
      </section>
    </div>
  );
}
