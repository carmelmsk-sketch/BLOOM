import { useState } from 'react';
import { ArrowRight, Check, ChevronLeft, CircleHelp } from 'lucide-react';
import { Link } from 'wouter';
import { Button, Card, Modal, Toast, PageHeader } from '@/components/ui';
import { creationTypes } from '@/services/demo-content';
import { useBloomState } from '@/hooks/use-bloom-state';

export default function CreatePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { notify, toast } = useBloomState();
  const selectedType = creationTypes.find((type) => type.id === selected);
  return <div className="content-wrap">
    <PageHeader eyebrow="Créer" title={<>Qu’est-ce que tu veux <em>créer ?</em></>} description="Choisis un point de départ. Tu pourras toujours changer d’avis en chemin — les projets vivants ont le droit d’évoluer." action={<Link href="/" className="button button-ghost" data-testid="link-create-back"><ChevronLeft size={15} /> Accueil</Link>} />
    <div className="create-grid fade-up delay-1">
      {creationTypes.map((type) => { const Icon = type.icon; return <Card key={type.id} className={`create-card card-lift ${selected === type.id ? 'selected' : ''}`} onClick={() => setSelected(type.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelected(type.id); }} data-testid={`card-create-${type.id}`}><div className="create-icon"><Icon size={19} /></div><h3>{type.title}</h3><p>{type.description}</p>{selected === type.id && <Check size={16} style={{ position: 'absolute', bottom: 18, right: 18, color: '#8b6d26' }} />}</Card>; })}
    </div>
    <div className="create-footer fade-up delay-2"><Button variant="dark" disabled={!selected} onClick={() => setModalOpen(true)} data-testid="button-prepare-create">Préparer mon projet <ArrowRight size={15} /></Button><span className="muted">{selectedType ? `Tu as choisi : ${selectedType.title}` : 'Choisis un format pour continuer'}</span></div>
    <div className="card fade-up delay-3" style={{ maxWidth: 920, marginTop: 56, padding: 20, display: 'flex', alignItems: 'center', gap: 13, background: '#e9ddc6' }}><CircleHelp size={19} color="#8b6d26" /><p style={{ margin: 0, fontSize: 12, color: '#695e55', lineHeight: 1.5 }}><strong>Pas encore sûr·e ?</strong> Ce n’est pas grave. Bloom Coach peut t’aider à faire émerger le bon format.</p><Link href="/coach" className="button button-outline" style={{ marginLeft: 'auto', flexShrink: 0 }} data-testid="link-create-coach">Demander à Bloom</Link></div>
    {modalOpen && selectedType && <Modal title={`${selectedType.title} : bon choix.`} description="Cette étape est prête pour la suite du produit, mais reste en mode démonstration pour le moment." onClose={() => setModalOpen(false)}><div style={{ background: '#e9ddc6', borderRadius: 12, padding: 15, color: '#695e55', fontSize: 13, lineHeight: 1.55 }}>On va bientôt pouvoir te guider dans les premières étapes de ton projet <strong>{selectedType.title.toLowerCase()}</strong>. Pour l’instant, garde cette intuition précieusement.</div><Button variant="primary" style={{ marginTop: 18, width: '100%' }} onClick={() => { setModalOpen(false); notify('Ton point de départ a été gardé dans cette démo.'); }} data-testid="button-confirm-create">Continuer dans la démo</Button></Modal>}
    <Toast message={toast} />
  </div>;
}