import { useState } from 'react';
import { ArrowUp, Compass, Lightbulb, MessageCircle, PackageOpen, Sparkles } from 'lucide-react';
import { Button, Card, Input, PageHeader } from '@/components/ui';
import { useBloomState } from '@/hooks/use-bloom-state';

const prompts = [
  { label: `J'ai une idée`, icon: Lightbulb },
  { label: 'Je veux créer mon premier produit', icon: PackageOpen },
  { label: 'Je ne sais pas quoi vendre', icon: Compass },
  { label: `J'ai besoin d'aide`, icon: MessageCircle },
];

export default function CoachPage() {
  const [feedback, setFeedback] = useState('');
  const [input, setInput] = useState('');
  const { notify } = useBloomState();

  const choosePrompt = (prompt: string) =>
    setFeedback(`Merci de le poser. On pourrait commencer par préciser ce que « ${prompt.toLowerCase()} » veut dire pour toi. Cette première question sert à mieux comprendre ton contexte.`);

  const send = () => {
    if (!input.trim()) return;
    choosePrompt(input.trim());
    setInput('');
    notify('Ton message est gardé dans cette démo locale.');
  };

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="Ton compagnon de route"
        title="Bloom Coach"
        description="Une idée, une question ou un blocage ? On peut commencer ici."
      />
      <div className="coach-layout fade-up delay-1">
        <section className="coach-intro">
          <div className="kicker" style={{ color: '#d9b965' }}>Interface en préparation</div>
          <h2>
            Pose les mots.
            <br />
            <span style={{ color: '#c9a84c' }}>On trouvera la forme.</span>
          </h2>
          <p style={{ marginTop: 20 }}>
            Pas besoin d'avoir une question parfaitement formulée. Partage simplement ce qui t'occupe l'esprit en ce moment. Je suis ici pour clarifier et t'aider à avancer.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
            {prompts.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  onClick={() => choosePrompt(p.label)}
                  style={{
                    padding: 16,
                    border: '1px solid rgba(244, 240, 232, 0.2)',
                    background: 'transparent',
                    color: '#f4f0e8',
                    cursor: 'pointer',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244, 240, 232, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                  data-testid={`button-coach-prompt-${p.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={16} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </section>
        <Card className="coach-chat">
          <div className="chat-top">
            <h3>La première question</h3>
            <span className="badge badge-demo">Démo</span>
          </div>
          {feedback ? (
            <>
              <div className="chat-bubble" data-testid="text-coach-response" style={{ marginBottom: 16 }}>
                {feedback}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  type="text"
                  placeholder="Tape ta réponse..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && send()}
                  style={{ flex: 1 }}
                  data-testid="input-coach-reply"
                />
                <Button variant="primary" onClick={send} data-testid="button-send-reply">
                  <ArrowUp size={16} />
                </Button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af' }}>
              Clique sur une question pour commencer la conversation.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
