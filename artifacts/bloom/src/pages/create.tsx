import { useState } from 'react';
import { ArrowRight, Check, ChevronLeft, CircleHelp } from 'lucide-react';
import { Button, Card, Modal, Toast, PageHeader } from '@/components/ui';
import { creationTypes } from '@/services/demo-content';
import { useBloomState } from '@/hooks/use-bloom-state';

export default function CreatePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { notify, toast } = useBloomState();
  const selectedType = creationTypes.find((type) => type.id === selected);

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="Créer"
        title={<>Qu'est-ce que tu veux <em>créer ?</em></> as any}
        description="Choisis un point de départ. Tu pourras toujours changer d'avis en chemin — les projets vivent et changent."
      />
      <div className="create-grid fade-up delay-1">
        {creationTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.id}
              className={`create-card card-lift ${selected === type.id ? 'selected' : ''}`}
              onClick={() => setSelected(type.id)}
              data-testid={`card-creation-${type.id}`}
              style={{ cursor: 'pointer' }}
            >
              <Icon size={32} style={{ color: '#a89860', marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{type.title}</h3>
              <p style={{ fontSize: 14, color: '#695e55', margin: 0 }}>{type.description}</p>
            </Card>
          );
        })}
      </div>
      <div className="create-footer fade-up delay-2">
        <Button
          variant="dark"
          disabled={!selected}
          onClick={() => setModalOpen(true)}
          data-testid="button-prepare-create"
        >
          Préparer mon projet <ArrowRight size={16} />
        </Button>
      </div>
      <div
        className="card fade-up delay-3"
        style={{
          maxWidth: 920,
          marginTop: 56,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          background: '#e9ddc6',
        }}
      >
        <CircleHelp size={19} color="#695e55" />
        <div style={{ fontSize: 14, color: '#3f2f1f' }}>
          <strong>Tu hésites?</strong> Pas de panique. Essaie simplement ce qui te
          parle. Tu pourras explorer d'autres formes après.
        </div>
      </div>
      {modalOpen && selectedType && (
        <Modal
          title={`${selectedType.title} : bon choix.`}
          description="Cette étape est prête pour la suite du produit, mais reste en mode démonstration pour le moment."
          onClose={() => setModalOpen(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14, color: '#695e55', margin: 0 }}>
              Nous préparons actuellement les formulaires pour te guider dans la
              création de <strong>{selectedType.title.toLowerCase()}</strong>.
            </p>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
              Pour l'instant, tu peux explorer les autres sections et revenir ici
              bientôt.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                notify(
                  'Merci pour ton intérêt! Les outils arrivent bientôt.'
                );
                setModalOpen(false);
              }}
              style={{ marginTop: 12 }}
              data-testid="button-modal-understood"
            >
              J'ai compris, à bientôt! <Check size={16} />
            </Button>
          </div>
        </Modal>
      )}
      <Toast message={toast} />
    </div>
  );
}
