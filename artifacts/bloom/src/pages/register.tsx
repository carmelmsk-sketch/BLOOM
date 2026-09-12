import { useState } from "react"
import { ArrowRight, Mail, Lock, User, UserRound } from "lucide-react"
import { Button, Input, Card, Toast } from "@/components/ui"
import { useBloomState } from "@/hooks/use-bloom-state"
import { apiPost } from "@/services/api"

type SignupResponse = {
  authenticated: boolean
  user: unknown
  requiresEmailConfirmation?: boolean
}

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { notify, toast } = useBloomState()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanFirstName || !cleanLastName || !cleanEmail || !password || !confirmPassword) {
      setError("Tous les champs sont requis.")
      return
    }

    if (cleanFirstName.length < 2 || cleanLastName.length < 2) {
      setError("Le prénom et le nom doivent contenir au moins 2 caractères.")
      return
    }

    if (!isValidPassword(password)) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      )
      return
    }

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)

    try {
      const result = await apiPost<SignupResponse>("/auth/signup", {
        email: cleanEmail,
        password,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        displayName: `${cleanFirstName} ${cleanLastName}`,
      })

      if (result.requiresEmailConfirmation || !result.authenticated) {
        notify("Compte créé. Vérifie ton adresse e-mail pour continuer.")
        window.setTimeout(() => {
          window.location.href = "/login"
        }, 1200)
        return
      }

      notify("Inscription réussie.")
      window.setTimeout(() => {
        window.location.href = "/onboarding"
      }, 500)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le compte."
      )
    } finally {
      setLoading(false)
    }
  }

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
      <Card style={{ maxWidth: 460, width: "100%", padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Créer un compte
        </h1>

        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
          Rejoins la communauté BLOOM
        </p>

        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "#6b6d6d",
                }}
              >
                <User size={14} /> Prénom
              </label>

              <Input
                type="text"
                placeholder="Ton prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                autoComplete="given-name"
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
                  color: "#6b6d6d",
                }}
              >
                <UserRound size={14} /> Nom
              </label>

              <Input
                type="text"
                placeholder="Ton nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                autoComplete="family-name"
                style={{ width: "100%" }}
              />
            </div>
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
                color: "#6b6d6d",
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
              autoComplete="email"
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
                color: "#6b6d6d",
              }}
            >
              <Lock size={14} /> Mot de passe
            </label>

            <Input
              type="password"
              placeholder="Ex. Bloom2026"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              style={{ width: "100%" }}
            />

            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              8 caractères minimum.
            </p>
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
                color: "#6b6d6d",
              }}
            >
              <Lock size={14} /> Confirmer le mot de passe
            </label>

            <Input
              type="password"
              placeholder="Retape ton mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
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
            <ArrowRight size={16} />
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
              color: "#4b86b6",
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
  )
}
