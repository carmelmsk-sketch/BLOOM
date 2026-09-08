import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  apiGet,
  apiPost,
  apiPatch,
  type Profile,
  type SessionResponse,
  type SessionUser,
  type ProfileResponse,
} from "@/services/api";

type AuthContextValue = {
  user: SessionUser | null;
  profile: Profile | null;
  schemaReady: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schemaReady, setSchemaReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const session = await apiGet<SessionResponse>("auth/session");

      if (!session.authenticated || !session.user) {
        setUser(null);
        setProfile(null);
        setSchemaReady(false);
        return;
      }

      setUser(session.user);

      try {
        const result = await apiGet<ProfileResponse>("profile");
        setProfile(result.profile);
        setSchemaReady(result.schemaReady);
      } catch {
        setProfile(null);
        setSchemaReady(false);
      }
    } catch {
      setUser(null);
      setProfile(null);
      setSchemaReady(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await apiPost<void>("auth/signout", {});
    } finally {
      setUser(null);
      setProfile(null);
      setSchemaReady(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    schemaReady,
    loading,
    refresh,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }

  return context;
}

export async function saveProfile(
  body: Partial<
    Profile & {
      onboarding_goal?: string;
      onboarding_completed?: boolean;
    }
  >,
) {
  const result = await apiPatch<{ profile: Profile }>("profile", body);
  return result.profile;
}
