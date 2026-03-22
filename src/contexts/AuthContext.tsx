import { createContext, useContext, useEffect, useState } from 'react';
import type { LoginInput, Organization, Profile, RegisterInput, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { mapOrganization, mapProfile } from '@/utils/mappers';
import { ROUTES } from '@/utils/constants';

interface AuthContextValue {
  session: { userId: string } | null;
  currentProfile: Profile | null;
  currentOrganization: Organization | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (input: LoginInput & { password: string }) => Promise<{ success: boolean; message?: string; redirectTo: string }>;
  register: (input: RegisterInput & { password: string }) => Promise<{ success: boolean; message?: string; redirectTo: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getDashboardRoute(role: UserRole) {
  return role === 'organization' ? ROUTES.orgDashboard : ROUTES.userDashboard;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ userId: string } | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileRow) {
      const profile = mapProfile(profileRow);
      setCurrentProfile(profile);
      if (profile.role === 'organization') {
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('*')
          .eq('profile_id', userId)
          .single();
        setCurrentOrganization(orgRow ? mapOrganization(orgRow) : null);
      } else {
        setCurrentOrganization(null);
      }
    } else {
      setCurrentProfile(null);
      setCurrentOrganization(null);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) {
        setSession({ userId: data.session.user.id });
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setSession(null);
        setCurrentProfile(null);
        setCurrentOrganization(null);
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession?.user?.id) {
        setSession({ userId: authSession.user.id });
        loadProfile(authSession.user.id);
      } else {
        setSession(null);
        setCurrentProfile(null);
        setCurrentOrganization(null);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login: AuthContextValue['login'] = async ({ email, password, role }) => {
    if (!supabase) {
      return { success: false, message: 'Supabase not configured.', redirectTo: ROUTES.auth };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { success: false, message: error?.message ?? 'Login failed', redirectTo: ROUTES.auth };
    }

    const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    const profile = profileRow ? mapProfile(profileRow) : null;
    if (profile) {
      setCurrentProfile(profile);
      if (profile.role === 'organization') {
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('*')
          .eq('profile_id', data.user.id)
          .single();
        setCurrentOrganization(orgRow ? mapOrganization(orgRow) : null);
      } else {
        setCurrentOrganization(null);
      }
    }

    const profileRole = profile?.role ?? role;
    return {
      success: true,
      redirectTo: profile?.onboardingComplete ? getDashboardRoute(profileRole) : ROUTES.onboarding,
    };
  };

  const register: AuthContextValue['register'] = async ({ name, email, role, password }) => {
    if (!supabase) {
      return { success: false, message: 'Supabase not configured.', redirectTo: ROUTES.auth };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      return { success: false, message: error?.message ?? 'Registration failed', redirectTo: ROUTES.auth };
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      name,
      email,
      onboarding_complete: false,
      location_text: role === 'organization' ? 'Add your operating area' : 'Add your neighborhood',
      lat: 41.8781,
      lng: -87.6298,
    });

    if (profileError) {
      return { success: false, message: profileError.message, redirectTo: ROUTES.auth };
    }

    await loadProfile(data.user.id);

    return {
      success: true,
      redirectTo: ROUTES.onboarding,
    };
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setCurrentProfile(null);
    setCurrentOrganization(null);
  };

  const refreshSession = async () => {
    if (session?.userId) {
      await loadProfile(session.userId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        currentProfile,
        currentOrganization,
        role: currentProfile?.role ?? null,
        isAuthenticated: Boolean(currentProfile),
        loading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
