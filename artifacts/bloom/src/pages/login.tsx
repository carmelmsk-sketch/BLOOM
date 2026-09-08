import React, { useState } from "react";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { Button, Input, Card, Toast } from "@/components/ui";
import { useBloomState } from "@/hooks/use-bloom-state";
import { apiPost } from "@/services/api";

type LoginResponse = {
  authenticated: boolean;
  user: unknown;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify, toast } = useBloomState();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Email et mot de passe requis.");
      return;
    }

    setLoading(true);

    try {
      await apiPost<LoginResponse>("auth/signin", {
        email: cleanEmail,
        password,
      });

      notify("Connexion réussie.");

      window.setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de se connecter."
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
            Connexion
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Retrouve ton espace BLOOM
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
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
              placeholder="Ton mot de passe"
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
            style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
            {!loading && <ArrowRight size={16} />}
          </Button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>
          Tu n&apos;as pas de compte ?{" "}
          <a
            href="/register"
            style={{
              color: "#a0b086",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            S&apos;inscrire
          </a>
        </div>

        <Toast message={toast} />
      </Card>
    </div>
  );
}
