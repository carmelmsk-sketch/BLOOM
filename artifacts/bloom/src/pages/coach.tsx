import { useState } from 'react';
import { ArrowUp, Compass, Lightbulb, MessageCircle, PackageOpen, Sparkles } from 'lucide-react';
import { Button, Card, Input, PageHeader } from '@/components/ui';
import { useBloomState } from '@/hooks/use-bloom-state';

const prompts = [
  { label: 'J’ai une idée', icon: Lightbulb },
  { label: 'Je veux créer mon premier produit', icon: PackageOpen },
  { label: 'Je ne sais pas quoi vendre', icon: Compass },
  { label: 'J’ai besoin d’aide', icon: MessageCircle },
];

export default function CoachPage() {
  const [feedback, setFeedback] = useState('');
  const [input, setInput] = useState('');
  const { notify } = useBloomState();
  const choosePrompt = (prompt: string) => setFeedback(`Merci de le poser. On pourrait commencer par préciser ce que « ${prompt.toLowerCase()} » veut dire pour toi. Cette première question sera bientôt le début d’un vrai échange.`);
  const send = () => { if (!input.trim()) return; choosePrompt(input.trim()); setInput(''); notify('Ton message est gardé dans cette démo locale.'); };
  return <div className="content-wrap">
    <PageHeader eyebrow="Ton compagnon de route" title="Bloom Coach" description="Une idée, une question ou un blocage ? On peut commencer ici." />
    <div className="coach-layout fade-up delay-1">
      <section className="coach-intro"><div className="kicker" style={{ color: '#d9b965' }}>Interface en préparation</div><h2>Pose les mots.<br /><span style={{ color: '#c9a84c' }}>On trouvera la suite.</span></h2><p>Bloom Coach est un espace de réflexion pour t’aider à clarifier ton projet, sans réponse toute faite ni pression de résultat.</p><div className="coach-mark">+ bloom</div></section>
      <Card className="coach-chat"><div className="chat-top"><h3>La première question</h3><span className="badge badge-demo">Démo</span></div><div className="chat-bubble" data-testid="text-coach-greeting">Bonjour. Qu’est-ce qui prend le plus de place dans ta tête aujourd’hui ?</div>{feedback && <div className="prompt-feedback" data-testid="text-coach-feedback"><strong>Bloom Coach</strong><br />{feedback}</div>}<div className="prompt-grid">{prompts.map((prompt) => { const Icon = prompt.icon; return <button key={prompt.label} className="prompt-button" onClick={() => choosePrompt(prompt.label)} data-testid={`button-coach-${prompt.label.toLowerCase().replaceAll(' ', '-')}`}><Icon />{prompt.label}</button>; })}</div><div className="chat-input"><Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') send(); }} placeholder="Écris ce qui te traverse..." aria-label="Écrire à Bloom Coach" data-testid="input-coach-message" /><Button variant="dark" onClick={send} aria-label="Envoyer le message" data-testid="button-send-coach"><ArrowUp size={16} /></Button></div><div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a8c80', fontSize: 10, marginTop: 12 }}><Sparkles size={12} /> Réponses simulées pour cette première version</div></Card>
    </div>
  </div>;
}