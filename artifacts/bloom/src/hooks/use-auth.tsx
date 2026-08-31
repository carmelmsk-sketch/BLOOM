import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiGet, apiPost, apiPatch, type Profile, type SessionResponse, type SessionUser } from '@/services/api';

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
      const session = await apiGet<SessionResponse>('/auth/session');
      setUser(session.authenticated ? session.user : null);
      if (session.authenticated) {
        try {
          const result = await apiGet<{ profile: Profile | null; schemaReady: boolean }>('/profile');
          setProfile(result.profile);
          setSchemaReady(result.schemaReady);
        } catch {
          setProfile(null);
          setSchemaReady(false);
        }
      } else {
        setProfile(null);
        setSchemaReady(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await apiPost('/auth/signout');
    setUser(null);
    setProfile(null);
    setSchemaReady(false);
  }, []);

  const value = useMemo(() => ({ user, profile, schemaReady, loading, refresh, signOut }), [user, profile, schemaReady, loading, refresh, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
}

export async function saveProfile(body: Partial<Profile> & { onboarding_goal?: string; onboarding_completed?: boolean }) {
  return apiPatch<{ profile: Profile }>('/profile', body);
}