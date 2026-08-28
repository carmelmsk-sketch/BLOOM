import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return <div className="content-wrap"><div className="hero" style={{ minHeight: 430 }}><div className="hero-copy"><div className="kicker">Erreur 404</div><h1 className="display">Cette page a<br /><em>pris un détour.</em></h1><p>On peut revenir à un endroit plus intéressant. Ton prochain projet t’attend toujours.</p><div className="hero-actions"><Link href="/" className="button button-primary" data-testid="link-not-found-home"><ArrowLeft size={15} /> Revenir à l’accueil</Link><Link href="/discover" className="button button-outline" data-testid="link-not-found-discover"><Compass size={15} /> Découvrir</Link></div></div></div></div>;
}