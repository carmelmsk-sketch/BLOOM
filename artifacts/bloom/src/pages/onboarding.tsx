import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, User, Target } from "lucide-react";
import { useLocation } from "wouter";
import { Button, Card, Input } from "@/components/ui";
import { useBloomState } from "@/hooks/use-bloom-state";
import { useAuth, saveProfile } from "@/hooks/use-auth";

type OnboardingStep = "welcome" | "profile" | "objective" | "done";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, refresh } = useAuth();
  const { notify, toast } = useBloomState();

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [username, setUsername] = useState("");
  const [objective, setObjective] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/register");
    }
  }, [authLoading, user, setLocation]);

  useEffect(() => {
    if (user?.user_metadata?.display_name && !username) {
      setUsername(String(user.user_metadata.display_name));
    }
  }, [user, username]);

  const handleNext = async () => {
    if (loading) return;

    if (step === "welcome") {
      setStep("profile");
      return;
    }

    if (step === "profile") {
      if (!username.trim()) {
        notify("Ton nom d'utilisateur est requis");
        return;
      }

      setStep("objective");
      return;
    }

    if (step === "objective") {
      if (!objective.trim()) {
        notify("Ton objectif est requis");
        return;
      }

      setLoading(true);

      try {
        await saveProfile({
          username: username.trim(),
          onboarding_goal: objective.trim(),
          onboarding_completed: true,
        });

        await refresh();

        notify("Bienvenue sur BLOOM !");
        setStep("done");

        window.setTimeout(() => {
          setLocation("/");
        }, 1200);
      } catch (error) {
        notify(
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer ton profil.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkip = () => {
    setStep("done");

    window.setTimeout(() => {
      setLocation("/");
    }, 800);
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div
      className="content-wrap"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 40,
      }}
    >
      {step === "welcome" && (
        <Card
          style={{
            maxWidth: 500,
            width: "100%",
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 24 }}>BLOOM</div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              margin: "0 0 16px",
            }}
          >
            Bienvenue !
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#696969",
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            Ton espace pour apprendre, créer et vendre. Commençons par te
            connaître un peu mieux.
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <Button
              variant="outline"
              onClick={handleSkip}
              style={{ flex: 1 }}
            >
              Sauter
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              style={{ flex: 1 }}
            >
              Commencer <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {step === "profile" && (
        <Card
          style={{
            maxWidth: 500,
            width: "100%",
            padding: 40,
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Ton identité
          </h2>

          <p style={{ fontSize: 14, color: "#696969", margin: 0 }}>
            Comment veux-tu être connu(e) ?
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              marginTop: 24,
            }}
          >
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#0d0d0d",
                }}
              >
                <User size={16} />
                Nom d'utilisateur
              </label>

              <Input
                type="text"
                placeholder="Ton identité créative"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={loading}
                style={{ width: "100%" }}
              />

              <p
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  marginTop: 6,
                }}
              >
                Visible pour les autres créateurs.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <Button
              variant="outline"
              onClick={() => setStep("welcome")}
              style={{ flex: 1 }}
              disabled={loading}
            >
              Retour
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              style={{ flex: 1 }}
              disabled={loading}
            >
              Suivant <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {step === "objective" && (
        <Card
          style={{
            maxWidth: 500,
            width: "100%",
            padding: 40,
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Ton objectif
          </h2>

          <p style={{ fontSize: 14, color: "#696969", margin: 0 }}>
            Qu'est-ce qui t'a mené ici ?
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              marginTop: 24,
            }}
          >
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#0d0d0d",
                }}
              >
                <Target size={16} />
                Ton objectif
              </label>

              <textarea
                placeholder="Je veux créer, partager, vendre ou développer mon projet..."
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid rgba(13, 13, 13, 0.1)",
                  borderRadius: 8,
                  fontSize: 14,
                  minHeight: 100,
                  fontFamily: "var(--app-font-sans)",
                  resize: "vertical",
                }}
              />

              <p
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  marginTop: 6,
                }}
              >
                Cela nous aide à personnaliser ton expérience.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <Button
              variant="outline"
              onClick={() => setStep("profile")}
              style={{ flex: 1 }}
              disabled={loading}
            >
              Retour
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Terminer"}
              {loading && <CheckCircle size={16} />}
            </Button>
          </div>
        </Card>
      )}

      {step === "done" && (
        <Card
          style={{
            maxWidth: 500,
            width: "100%",
            padding: 40,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 24,
              animation: "fadeIn 0.6s ease-out",
            }}
          >
            🎉
          </div>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: "0 0 10px",
            }}
          >
            C'est parti !
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#696969",
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}
          >
            Ton espace BLOOM est prêt. Redirection en cours...
          </p>
        </Card>
      )}

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
