import React, { useState } from "react";
import { ArrowRight, Mail, Lock, User } from "lucide-react";
import { Button, Input, Card, Toast } from "@/components/ui";
import { useBloomState } from "@/hooks/use-bloom-state";
import { apiPost } from "@/services/api";

type SignupResponse = {
  authenticated: boolean;
  user: unknown;
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify, toast } = useBloomState();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();

    if (!cleanEmail || !password || !cleanDisplayName) {
      setError("Tous les champs sont requis.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (cleanDisplayName.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères.");
      return;
    }

    setLoading(true);

    try {
      await apiPost<SignupResponse>("auth/signup", {
        email: cleanEmail,
        password,
        displayName: cleanDisplayName,
      });

      notify("Inscription réussie.");

      window.setTimeout(() => {
        window.location.href = "/onboarding";
      }, 300);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le compte."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="content-wrap"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <Card style={{ maxWidth: 420, width: "100%", padding: 32 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>
            Créer un compte
          </h1>

          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Rejoins la communauté BLOOM
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
                color: "#6d6d6d",
              }}
            >
              <User size={14} /> Nom ou surnom
            </label>

            <Input
              type="text"
              placeholder="Ton nom ou surnom"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
                color: "#6d6d6d",
              }}
            >
              <Mail size={14} /> Email
            </label>

            <Input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
                color: "#6d6d6d",
              }}
            >
              <Lock size={14} /> Mot de passe
            </label>

            <Input
              type="password"
              placeholder="Au moins 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{ width: "100%" }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: 12,
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                fontSize: 13,
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          <Button
            variant="primary"
            type="submit"
            style={{
              width: "100%",
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
            {!loading && <ArrowRight size={16} />}
          </Button>
        </form>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          Tu as déjà un compte ?{" "}
          <a
            href="/login"
            style={{
              color: "#a0b086",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Se connecter
          </a>
        </div>

        <Toast message={toast} />
      </Card>
    </div>
  );
}
