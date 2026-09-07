import { useState } from 'react';
import { ArrowUp, Compass, Lightbulb, LoaderCircle, MessageCircle, PackageOpen, Sparkles } from 'lucide-react';
import { apiPost, type ApiError } from '@/services/api';
import { Button, Card, Input, PageHeader } from '@/components/ui';

const prompts = [
  { label: 'J’ai une idée', icon: Lightbulb },
  { label: 'Je veux créer mon premier produit', icon: PackageOpen },
  { label: 'Je ne sais pas quoi vendre', icon: Compass },
  { label: 'J’ai besoin d’aide', icon: MessageCircle },
];

export default function CoachPage() {
  const [feedback, setFeedback] = useState('');
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  async function send(text = input) {
    const message = text.trim(); if (!message || sending) return;
    setSending(true); setStatus('');
    try {
      let id = conversationId;
      if (!id) { const created = await apiPost<{ conversation: { id: string } }>('/coach/conversations', { title: message.slice(0, 60) }); id = created.conversation?.id ?? null; setConversationId(id); }
      if (id) { const result = await apiPost<{ ai_status: string }>('/coach/conversations/' + id + '/messages', { content: message }); setFeedback(result.ai_status === 'not_configured' ? 'Ton message est bien gardé dans ta conversation. La réponse IA sera activée quand un fournisseur sécurisé sera connecté.' : 'Bloom revient vers toi bientôt.'); }
      setInput('');
    } catch (cause) { const error = cause as ApiError; setStatus(error.message); }
    finally { setSending(false); }
  }
  return <div className="content-wrap"><PageHeader eyebrow="Ton compagnon de route" title="Bloom Coach" description="Une idée, une question ou un blocage ? On peut commencer ici." /><div className="coach-layout fade-up delay-1"><section className="coach-intro"><div className="kicker" style={{ color: '#d9b965' }}>Espace conversationnel</div><h2>Pose les mots.<br /><span style={{ color: '#c9a84c' }}>On trouvera la suite.</span></h2><p>Bloom Coach garde tes réflexions au même endroit. La génération IA sera branchée plus tard côté serveur, sans jamais exposer de clé dans le navigateur.</p><div className="coach-mark">+ bloom</div></section><Card className="coach-chat"><div className="chat-top"><h3>La première question</h3><span className="badge badge-demo">Prêt pour l’IA</span></div><div className="chat-bubble">Bonjour. Qu’est-ce qui prend le plus de place dans ta tête aujourd’hui ?</div>{feedback && <div className="prompt-feedback"><strong>Bloom Coach</strong><br />{feedback}</div>}{status && <div className="form-status error">{status}</div>}<div className="prompt-grid">{prompts.map((prompt) => { const Icon = prompt.icon; return <button key={prompt.label} className="prompt-button" onClick={() => void send(prompt.label)}><Icon />{prompt.label}</button>; })}</div><div className="chat-input"><Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void send(); }} placeholder="Écris ce qui te traverse…" aria-label="Écrire à Bloom Coach" /><Button variant="dark" onClick={() => void send()} disabled={sending} aria-label="Envoyer le message">{sending ? <LoaderCircle className="spin" size={16} /> : <ArrowUp size={16} />}</Button></div><div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a8c80', fontSize: 10, marginTop: 12 }}><Sparkles size={12} /> Tes messages restent dans ton espace.</div></Card></div></div>;
}