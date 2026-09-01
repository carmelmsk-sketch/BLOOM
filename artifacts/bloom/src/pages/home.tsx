import { ArrowRight, Compass, HeartHandshake, Lightbulb, MoveUpRight, Sparkles, Target, LogIn } from 'lucide-react';
import { Link } from 'wouter';
import { Button, Card } from '@/components/ui';

export default function HomePage() {
  const user = typeof window !== 'undefined' ? localStorage.getItem('bloom_user') : null;

  return (
    <div className="content-wrap">
      <section className="hero fade-up" data-testid="section-hero">
        <div className="hero-copy">
          <div className="kicker">Apprends. Crée. Vends. Développe.</div>
          <h1 className="display">
            Une idée mérite
            <br />
            <em>de la place.</em>
          </h1>
          <p>
            L'espace où tes idées peuvent devenir de vrais projets. BLOOM t'accompagne de la première intuition jusqu'aux prochaines étapes concrètes.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link href="/create" className="button button-primary" data-testid="link-hero-create">
                  Créer mon premier produit <ArrowRight size={16} />
                </Link>
                <Link href="/discover" className="button button-outline" data-testid="link-hero-discover">
                  Voir des exemples <Compass size={16} />
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="button button-primary" data-testid="link-hero-register">
                  Commencer à créer <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="button button-outline" data-testid="link-hero-login">
                  Je suis déjà membre <LogIn size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-stamp">
          Un espace
          <br />
          pour faire
          <br />
          grandir les idées
        </div>
      </section>

      <section style={{ marginTop: 70 }} className="fade-up delay-1">
        <div className="section-title">
          <div>
            <div className="kicker">La vision BLOOM</div>
            <h2>Quatre mouvements, un même élan.</h2>
          </div>
          <span className="kicker" style={{ color: '#695e55' }}>01 — 04</span>
        </div>
        <div className="vision-grid">
          {[
            ['01', 'Apprendre', 'Des ressources pour comprendre avant de faire.'],
            ['02', 'Créer', 'Un cadre pour donner forme à ce qui te ressemble.'],
            ['03', 'Vendre', 'Des repères pour proposer ce que tu fais.'],
            ['04', 'Développer', 'De l'espace pour évoluer et grandir.'],
          ].map(([num, title, desc], idx) => (
            <div key={idx} className="vision-item">
              <div className="kicker" style={{ fontSize: 20, fontWeight: 700 }}>{num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#695e55', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 70 }} className="fade-up delay-2">
        <div className="section-title">
          <div>
            <div className="kicker">Pourquoi Bloom ?</div>
            <h2>Pas plus de bruit. Plus de direction.</h2>
          </div>
        </div>
        <div className="why-grid">
          <div className="why-feature">
            <div className="kicker" style={{ color: '#d9b965' }}>Une plateforme qui reste humaine</div>
            <h3>
              Tu n'as pas besoin d'avoir tout compris pour commencer.
            </h3>
            <p>
              Les tools puissants se cachent. Les premiers pas restent simples. Tu apprendras en créant.
            </p>
          </div>
          <div className="why-list">
            <div className="why-row">
              <div className="why-icon">
                <Lightbulb size={17} />
              </div>
              <div>
                <h4>Un chemin, pas une vitrine</h4>
                <p>
                  Des étapes simples pour ne pas rester seul·e face à la page blanche.
                </p>
              </div>
            </div>
            <div className="why-row">
              <div className="why-icon">
                <HeartHandshake size={17} />
              </div>
              <div>
                <h4>Des outils avec du sens</h4>
                <p>
                  Des formats pensés pour t'aider à faire, pas seulement à montrer.
                </p>
              </div>
            </div>
            <div className="why-row">
              <div className="why-icon">
                <Target size={17} />
              </div>
              <div>
                <h4>À ton rythme, vraiment</h4>
                <p>
                  Ton projet évolue, ton espace aussi. Rien n'est figé.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-grid fade-up delay-3">
        <div className="home-callout">
          <div className="kicker" style={{ color: '#285c68' }}>
            Commencer quelque part
          </div>
          <h3>Tu ne sais pas par où commencer ?</h3>
          <p>
            Bloom peut t'aider à poser les bonnes questions. Notre Coach en ligne te guide pas à pas.
          </p>
          <Link href="/coach" className="button button-outline" style={{ marginTop: 16 }}>
            Demander au Coach <MoveUpRight size={14} />
          </Link>
        </div>
        <Card className="home-mini">
          <div>
            <div className="kicker">Bloom évolue avec toi</div>
            <h3>De l'idée au projet, puis au prochain.</h3>
          </div>
          <Link href="/profile" className="button button-outline" style={{ marginTop: 16 }}>
            Voir mon profil <ArrowRight size={14} />
          </Link>
        </Card>
      </section>

      <section className="quote-band">
        <blockquote>
          "Le bon moment pour donner une chance à ton idée ? Celui où tu décides de lui faire une place."
        </blockquote>
        <cite>La philosophie Bloom</cite>
      </section>
    </div>
  );
}
